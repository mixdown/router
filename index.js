var _ = require('lodash');
var ControllerFactory = require('./lib/controller_factory.js');
var Router = require('./lib/router.js');
var url = require('url');
var Generator = require('./lib/generator.js');
var events = require('events');
var MockRequest = require('hammock').Request;
var MockResponse = require('hammock').Response;
var HttpContext = require('./lib/http_context.js');

require('substr-polyfill');

module.exports = Generator.extend({

  _namespace_default: 'router',

  init: function (options) {
    var self = this;

    this._super(options);
    this.controllers = new ControllerFactory(options);

    // cache the bound scope functions for use in router.create()
    this.authenticate_cached = _.bind(this.authenticate, this);
    this.authorize_cached = _.bind(this.authorize, this);

    // bubble both events
    this.controllers.on('invalid-route', function (data) {
      self.emit('invalid-route', data);
    });

    // bubble both events
    this.controllers.on('no-browser-handler', function (data) {
      self.emit('no-browser-handler', data);
    });

  },

  controllers: null,
  clientRouter: null,
  root: typeof (window) !== 'undefined' && window.location ? window.location.pathname : null,

  authorize: function (httpContext, callback) {
    callback(null, httpContext);
  },

  authenticate: function (httpContext, callback) {

    httpContext.user = {
      logged_in: false
    };

    callback(null, httpContext);
  },

  hasPushState: function () {
    return !!(window.history && window.history.pushState);
  },

  // Functions that use the route table and controller manifest.
  manifest: function (sanitize) {
    if (sanitize) {

      var manifestCopy = _.cloneDeep(this.controllers.manifest());

      _.each(manifestCopy, function (m, name) {
        _.each(m.params, function (p) {
          if (typeof (p.regex) !== 'string' && p.regex.source) {
            p.regex = p.regex.source;
          }
        });
      });

      return manifestCopy;

    } else {
      return this.controllers.manifest();
    }
  },

  // creates a router instance. This is the single server side node interface.
  create: function () {
    var new_router = new Router({
      controllers: this.controllers,
      timeout: this._options.timeout,
      app: this._options.app
    });

    new_router._authenticate = this.authenticate_cached;
    new_router._authorize = this.authorize_cached;
    return new_router;
  },

  // client side url navigation
  // 2 overloaded options
  //
  // 1. function(route, params, callback)
  // @param route {String}: named route to generate the url.
  // @param params {Object}: hash of params to send to url generation.
  //
  // 2. function(url, callback)
  // @param url {Object|String}: Can be url string or node url object.
  navigate: function (route, params, callback) {
    var self = this;

    if (!route) {
      return callback(new Error('Route not defined.'));
    }

    // handle 2 arg variant function signatures.
    if (arguments.length === 2) {
      var arg1 = arguments[1];

      if (typeof (arg1) === 'function') {
        callback = arg1;
        params = null;
      } else {
        callback = null;
        params = arg1;
      }
    }

    // keep a single instance around in a browser.
    if (!this.clientRouter) {
      this.clientRouter = this.create();

      this.clientRouter.on('error', function (err) {
        console.log(err.stack);
      });
    }

    var newUrl = null;
    var loc = this.location || url.parse(window.location.href);

    // If the route is in the route table, then generate the url.  If not, check for hash or finally a literal url.
    if (this.manifest()[route]) {
      newUrl = this.url(route, params);
    } else {
      newUrl = url.parse(route);
    }

    this.emit('navigate', newUrl);

    // old school url change for browsers w/o pushstate or without the polyfill.
    if (this.initialized && !this.hasPushState()) {
      window.location.href = url.format(newUrl);
      return;
    }

    var req_opt = {
      url: url.format(newUrl)
    };
    var req = new MockRequest(req_opt);
    var res = new MockResponse();


    // if the route was matched, then change the url.
    this.clientRouter.once('end', function (err, httpContext) {

      if (httpContext.url.href !== window.location.href) {

        // if supports pushState, then use it.  if not, then the controllers will already have replaced location in browser.
        if (self.hasPushState() && httpContext.controller && httpContext.controller.browser) {

          // emit page_loaded on all handler matches.
          self.emit('page_loaded', httpContext);

          if (httpContext.url.pathname === window.location.pathname &&
            httpContext.url.search == window.location.search &&
            (httpContext.url.hash || '') == window.location.hash) {

            window.history.replaceState(req_opt, document.title, httpContext.url.href);
          } else {
            window.history.pushState(req_opt, document.title, httpContext.url.href);
          }
        }

      } else {

        self.location = url.parse(window.location.href);

      }

    });

    // fire callback once the handler has executed.  Note: javascript is async.  The handler might not be done when this callback is fired... but you already knew that!
    this.clientRouter.once('end', function () {

      // these are here b/c EventEmitter.once() does not remove the event properly after it executes in
      // older browsers (specifically IE8)
      if (!self._hasPushState) {
        self.clientRouter.removeAllListeners('match');
        self.clientRouter.removeAllListeners('end');
      }

      return typeof (callback) === 'function' ? callback.apply(self, arguments) : null;
    });


    this.clientRouter.dispatch(req, res);

    return req;
  },

  // Used to call a controller within another controller.
  tunnel: function (route, params, parentContext, callback) {
    var controller = this.controllers.controllers[route];

    if (!controller) {
      return callback(new Error('No controller for route name - ' + route));
    }

    var httpContext = new HttpContext(
      new MockRequest({
        url: this.format(route, params),
        method: parentContext.request.method
      }),
      new MockResponse()
    );

    httpContext.app = parentContext.app;
    httpContext.id = parentContext.id;
    httpContext.user = parentContext.user;
    httpContext.user_agent = parentContext.user_agent;
    httpContext.body = parentContext.body;
    httpContext.controller = controller;

    controller.parse(httpContext);

    httpContext.response.on('finish', function () {
      var body = httpContext.response.buffer.join('');

      if (httpContext.response.statusCode != 200) {
        return callback(new Error('Response failed: ' + httpContext.response.statusCode), httpContext.response, body);
      }

      if (/json/.test(httpContext.response.getHeader('Content-Type'))) {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return callback(e, httpContext.response, body);
        }
      }

      callback(null, httpContext.response, body);

    });

    controller.handle(httpContext);

  },

  // For browsers: attach to popstate and perform initial navigate match
  listen: function (callback) {
    var self = this;

    if (this.hasPushState()) {
      // The popstate event - A popstate event is dispatched to the window every time the active history
      // entry changes. If the history entry being activated was created by a call to pushState or affected
      // by a call to replaceState, the popstate event's state property contains a copy of the history
      // entry's state object.
      // https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history
      // https://developer.mozilla.org/en-US/docs/Web/API/window.onpopstate

      // Previous comment - "WebKit-based browsers fire onpopstate on page load.""
      // This is only true when the script is evaluated before the page is fully loaded.
      // This implies that the router is starting to listen before the DOM is completely ready.
      window.onpopstate = function (e) {
        self.navigate(e.state ? e.state.url : window.location.href);
      };

    }

    self.navigate(window.location.href, function (err) {
      self.initialized = true;
      self.emit('initialized');
      ((typeof (callback) === 'function' ? callback(err) : null));
    });
  },
  _setup: function (done) {
    this.controllers.init(done);
  }
});