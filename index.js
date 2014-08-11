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

  init: function(options) {
    var self = this;

    this._super(options);
    this.controllers = new ControllerFactory(options);

    // cache the bound scope functions for use in router.create()
    this.authenticate_cached = _.bind(this.authenticate, this);
    this.authorize_cached = _.bind(this.authorize, this);

    // bubble both events
    this.controllers.on('invalid-route', function(data) {
      self.emit('invalid-route', data);
    });

    // bubble both events
    this.controllers.on('no-browser-handler', function(data) {
      self.emit('no-browser-handler', data);
    });

  },

  controllers: null,
  clientRouter: null,
  root: typeof(window) !== 'undefined' && window.location ? window.location.pathname : null,

  authenticate: function(httpContext, callback) {

    httpContext.user = {
      logged_in: false
    };

    callback(null, httpContext);
  },

  hasPushState: function() {
    return !!(window.history && window.history.pushState);
  },

  // Functions that use the route table and controller manifest.
  manifest: function(sanitize) {
    if (sanitize) {

      var manifestCopy = _.cloneDeep(this.controllers.manifest());

      _.each(manifestCopy, function(m, name) {
        _.each(m.params, function(p) {
          if (typeof(p.regex) !== 'string' && p.regex.source) {
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
  create: function() {
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
  navigate: function(route, params, callback) {
    var self = this;

    if (!route) {
      return callback(new Error('Route not defined.'));
    }

    // handle 2 arg variant function signatures.
    if (arguments.length === 2) {
      var arg1 = arguments[1];

      if (typeof(arg1) === 'function') {
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

      this.clientRouter.on('error', function(err) {
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

    // Test if this href is going to be the same as the current.
    // If same, then return b/c there is no reason to re-route.
    if (this.initialized &&
      newUrl.pathname === loc.pathname &&
      newUrl.search == loc.search &&
      newUrl.hash == loc.hash
    ) {
      return null;
    }

    this.emit('navigate', newUrl);

    // old school url change for browsers w/o pushstate or without the polyfill.
    if (this.initialized && !this.hasPushState()) {
      window.location.href = url.format(newUrl);
      return;
    }

    var req = new MockRequest({
      url: url.format(newUrl)
    });
    var res = new MockResponse();


    // if the route was matched, then change the url.  This will change the url in the address bar before the handler runs.
    // This is good for devs for the situation where there is a problem with the controller handler which will cause the pipeline to stop.
    this.clientRouter.once('match', function(httpContext) {

      if (httpContext.url.href !== window.location.href) {

        // html5-history-api should be used to support pushState with hashbangs
        if (self.hasPushState()) {
          window.history.pushState({}, document.title, httpContext.url.href);

          // if html5-history-api not loaded, then do an old school href assign.
        } else {
          window.location.href = httpContext.url.href;
          return;
        }

      }

      self.location = url.parse(window.location.href);

      // emit page_loaded on all handler matches.
      self.emit('page_loaded', httpContext);

    });

    // fire callback once the handler has executed.  Note: javascript is async.  The handler might not be done when this callback is fired... but you already knew that!
    this.clientRouter.once('end', function() {

      // these are here b/c EventEmitter.once() does not remove the event properly after it executes in
      // older browsers (specifically IE8)
      if (!self._hasPushState) {
        self.clientRouter.removeAllListeners('match');
        self.clientRouter.removeAllListeners('end');
      }

      return typeof(callback) === 'function' ? callback.apply(self, arguments) : null;
    });


    this.clientRouter.dispatch(req, res);

    return req;
  },

  // Used to call a controller within another controller.
  tunnel: function(route, params, parentContext, callback) {
    var controller = this.controllers.controllers[route];

    if (!controller) {
      return callback(new Error('No controller for route name - ' + route));
    }

    var httpContext = new HttpContext(
      new MockRequest({
        url: this.format(route, params)
      }),
      new MockResponse()
    );

    httpContext.app = parentContext.app;
    httpContext.id = parentContext.id;
    httpContext.user = parentContext.user;
    httpContext.user_agent = parentContext.user_agent;

    controller.parse(httpContext);

    httpContext.response.on('finish', function() {
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
  listen: function(callback) {
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
      window.onpopstate = function(e) {
        var newUrl = url.parse(window.location.href);

        // do not navigate to same url.  ignore hash since it should be a client side thing.
        if (newUrl.pathname !== self.location.pathname ||
          newUrl.search !== self.location.search) {

          self.navigate(window.location.href);
        }
      };

    }

    self.navigate(window.location.href, function(err) {
      self.initialized = true;
      ((typeof(callback) === 'function' ? callback(err) : null));
    });
  },
  _setup: function(done) {
    this.controllers.init(done);
  }
});