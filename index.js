var _ = require('lodash');
var plRouter = require('pipeline-router');
var util = require('util');
var url = require('url');
var querystring = require('querystring');
var Generator = require('./lib/generator.js');
var MockRequest = require('hammock').Request;
var MockResponse = require('hammock').Response;

var Router = function(namespace) {
  namespace = namespace || 'router';
  var instance = this;

  /**
  * Attaches a router plugin to an application.
  *
  **/ 
  this.attach = function (options) {
    var app = options.app;
    var handlers = options.handlers || instance;

    // attach the generator part of the router.
    app.plugins.use(new Generator(namespace), options);

    var self = this[namespace];
    var _clientRouter = null;
    
    // attach the server side component
    _.extend(self, {

      getHandler: function(key) {
        // check object first.
        // then check prototype.
        return _.isFunction(handlers[key]) ? handlers[key] : handlers.constructor.prototype[key];
      },

      /**
      * Creates a new instance of router.
      *
      **/
      create: function() {
        var newRouter = new plRouter();

        if (options.timeout) {
          newRouter.timeout = options.timeout;
        }
        
        var addParam = function (param, key) {

          if (param && param.regex) {

            if (param.kind.toLowerCase() === "rest") {
              newRouter.param(key, new RegExp(param.regex));
            }
            else if (param.kind.toLowerCase() === 'query') {
              newRouter.qparam(key, new RegExp(param.regex));
            }
          }
        };

        // add routes
        _.each(self.routes, function (route, key) {

          // add route-level params
          if (route.params) {
            _.each(route.params, addParam);
          }

          // check object first.
          var handler = self.getHandler(route.handler);

          // if we found the handler on the router, then bind it.
          if (_.isFunction(handler)) {
            newRouter.use(
              route.method, 
              route.path, 
              { timeout: route.timeout }, 
              handlers.constructor.prototype._baseHandler.bind(app, handler, route)
            );
          }

        });

        return newRouter;
      },

      listen: function(callback) {
        self.navigate(url.format(window.location), callback);
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
        var newUrl = null;

        // handle 2 arg variant function signatures.
        if (arguments.length === 2) {
           var arg1 = arguments[1];

           if (_.isFunction(arg1)) {
            callback = arg1;
            params = null;
           }
           else {
            callback = null;
            params = arg1;
           }
        }

        // if the route is in the route table, then generate the url.  if not, then this is a literal url.
        if (self.routes[route]) {
          newUrl = app.plugins.router.format(route, params);
        }
        else {
          newUrl = route;
        }

        if (!history.pushState) {
          window.location.href = newUrl;
          return;
        }

        // keep a single instance around in a browser.
        if (!_clientRouter) {
          _clientRouter = self.create();
        }

        var req = new MockRequest({ url: newUrl });
        var res = new MockResponse();

        // if the route was matched, then change the url.  This will change the url in the address bar before the handler runs.  
        // This is good for devs for the situation where there is a problem with the controller handler which will cause the pipeline to stop.
        _clientRouter.once('match', function(routerData) {
          var httpContext = routerData.httpContext;
          if (httpContext.url.href !== window.location.href) {
            history.pushState({}, httpContext.url.pathname, httpContext.url.href);
          }
        });

        // fire callback once the handler has executed.  Note: javascript is async.  The handler might not be done when this callback is fired... but you already knew that!
        _clientRouter.once('end', function(err, results) {

          _.isFunction(callback) ? callback(err, {
            matched: results[0].matched,
            res: res,
            req: req
          }) : null;

        });


        // fire async so that the req is pass to calling context.
        // setTimeout(_clientRouter.dispatch.bind(_clientRouter, req, res), 5);
        _clientRouter.dispatch(req, res);

        return req;
      }

    });

  };

};

Router.prototype._baseHandler = function() {
  var handler = arguments[0];
  var route = arguments[1];
  var httpContext = arguments[2];

  var context = _.clone(httpContext);
  context.app = this;
  context.route = route;

  handler.call(this, context);
};

module.exports = Router;