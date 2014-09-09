var _ = require('lodash');
var plRouter = require('pipeline-router');
var util = require('util');
var url = require('url');
var querystring = require('querystring');
var Generator = require('./lib/generator.js');
var MockRequest = require('hammock').Request;
var MockResponse = require('hammock').Response;
var EventEmitter = require('events').EventEmitter;

// Load polyfill for url.js bug regarding substr(-1)
require('substr-polyfill');

if (typeof(global) === 'undefined') {
  var global = typeof(window) === 'undefined' ? {} : window;
}

var Router = function(namespace) {
  namespace = namespace || 'router';
  var instance = this;

  /**
   * Attaches a router plugin to an application.
   *
   **/
  this.attach = function(options) {
    var app = options.app;
    var handlers = options.handlers || instance;

    // Cached regex for stripping a leading hash/slash and trailing space.
    var routeStripper = /^[#\/]+|\s+$/g;

    // Cached regex for stripping leading and trailing slashes.
    var rootStripper = /^\/+|\/+$/g;

    // Cached regex for removing a trailing slash.
    var trailingSlash = /\/$/;

    // attach EventEmitter interface
    var self = this[namespace] = new EventEmitter();

    // attach the generator part of the router.
    Generator.constructor.call(instance, namespace);
    Generator.prototype.attach.call(this, options);

    var self = this[namespace];
    var _clientRouter = null;

    // attach the server side component
    self.getHandler = function(key) {
      // check object first.
      // then check prototype.
      return typeof(handlers[key]) === 'function' ? handlers[key] : handlers.constructor.prototype[key];
    };

    /**
     * Creates a new instance of router.
     *
     **/
    self.create = function() {
      var newRouter = new plRouter();

      // browser should never execute timeout.
      if (typeof window !== 'undefined') {
        newRouter.timeout = 0;
      } else if (options.timeout) {
        newRouter.timeout = options.timeout;
      }

      var addParam = function(param, key) {

        if (param && param.regex) {

          if (param.kind.toLowerCase() === "rest") {
            newRouter.param(key, new RegExp(param.regex));
          } else if (param.kind.toLowerCase() === 'query') {
            newRouter.qparam(key, new RegExp(param.regex));
          }
        }
      };

      var routesWithBadHandlers = [];

      // add routes
      _.each(self.routes, function(route, key) {
        // if a handler is specified, validate and bind it
        if (route.handler) {
          // if HTML history exists (we are in a browser) and the route is not set to be interpreted
          // on the client, then we skip it.
          if (!route.browser && global.history) {
            return;
          }

          // add route-level params
          if (route.params) {
            _.each(route.params, addParam);
          }

          // check object first.
          var handler = self.getHandler(route.handler);

          // if we found the handler on the router, then bind it.
          if (typeof(handler) === 'function') {
            newRouter.use(
              route.method,
              route.path, {
                timeout: route.timeout
              },
              route.formats,
              _.bind(handlers.constructor.prototype._baseHandler, app, handler, route)
            );
          } else {
            routesWithBadHandlers.push(route.name);
          }
        }
      });

      if (routesWithBadHandlers.length !== 0) {
        throw new Error('the following routes have invalid handlers: ' + routesWithBadHandlers.join(' '));
      }

      return newRouter;
    };

    self.listen = function(callback) {
      self._hasPushState = !! (window.history && window.history.pushState);
      self.root = window.location.pathname;
      self.checkRoot = _.isBoolean(options.checkRoot) ? options.checkRoot : true;

      // Build a URL string for navigating w/o hash or additional search params
      var getUrlString = function() {
        if (self.checkRoot) {
          var loc = window.location;
          return loc.protocol + '//' + loc.host + self.root + ((loc.hash) ? loc.hash.replace(routeStripper, '') : loc.search);
        } else {
          return window.location.href;
        }
      };

      if (self._hasPushState) {
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
          self.navigate(getUrlString());
        };

      }

      self.navigate(getUrlString(), callback);
    };

    // client side url navigation
    // 2 overloaded options
    //
    // 1. function(route, params, callback)
    // @param route {String}: named route to generate the url.
    // @param params {Object}: hash of params to send to url generation.
    //
    // 2. function(url, callback)
    // @param url {Object|String}: Can be url string or node url object.
    self.navigate = function(route, params, callback) {

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
      if (!_clientRouter) {
        _clientRouter = self.create();
      }

      var newUrl = null;
      var loc = self.location || url.parse(window.location.href);


      // If the route is in the route table, then generate the url.  If not, check for hash or finally a literal url.
      if (self.routes[route]) {
        newUrl = app.plugins.router.url(route, params);
      } else {
        var newUrl = url.parse(route);
      }

      // Test if this href is going to be the same as the current.
      // If same, then return b/c there is no reason to re-route.
      if (self.initialized &&
        newUrl.pathname === loc.pathname &&
        newUrl.search == loc.search &&
        newUrl.hash == loc.hash
      ) {
        return null;
      }

      self.emit('navigate', newUrl);

      // old school url change for browsers w/o pushstate or without the polyfill.
      if (!self._hasPushState && self.initialized) {
        window.location.href = url.format(newUrl);
        return;
      }

      var req = new MockRequest({
        url: url.format(newUrl)
      });
      var res = new MockResponse();

      // if the route was matched, then change the url.  This will change the url in the address bar before the handler runs.
      // This is good for devs for the situation where there is a problem with the controller handler which will cause the pipeline to stop.
      _clientRouter.once('match', function(routerData) {
        var httpContext = routerData.httpContext;

        if (httpContext.url.href !== window.location.href) {

          // html5-history-api should be used to support pushState with hashbangs
          if (self._hasPushState) {
            window.history.pushState({}, document.title, httpContext.url.href);

            // if html5-history-api not loaded, then do an old school href assign.
          } else {
            window.location.href = httpContext.url.href;
          }

        }

        self.location = url.parse(window.location.href);

        // emit page_loaded on all handler matches.
        self.emit('page_loaded', routerData);

      });

      // fire callback once the handler has executed.  Note: javascript is async.  The handler might not be done when this callback is fired... but you already knew that!
      _clientRouter.once('end', function(err, results) {

        // these are here b/c EventEmitter.once() does not remove the event properly after it executes in
        // older browsers (specifically IE8)
        if (!self._hasPushState) {
          _clientRouter.removeAllListeners('match');
          _clientRouter.removeAllListeners('end');
        }

        typeof(callback) === 'function' ? callback(err, {
          matched: results[0].matched,
          res: res,
          req: req
        }) : null;

      });


      // fire async so that the req is pass to calling context.
      // setTimeout(_clientRouter.dispatch.bind(_clientRouter, req, res), 5);
      _clientRouter.dispatch(req, res);

      self.initialized = true;
      return req;
    };
  };

  this.init = function(done) {
    var self = this[namespace];
    try {
      var attempt = self.create();
    } catch (err) {
      done(err);
      return;
    }

    done(null, self);
  };
};

Router.prototype._baseHandler = function() {
  var handler = arguments[0];
  var route = arguments[1];
  var httpContext = arguments[2];

  httpContext.app = this;
  httpContext.route = route;

  handler.call(this, httpContext);
};

module.exports = Router;