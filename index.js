var _ = require('lodash');
var plRouter = require('pipeline-router');
var util = require('util');
var url = require('url');
var querystring = require('querystring');
var Generator = require('./lib/generator.js');

var Router = function() {
  this.name = 'router';
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

/**
* Attaches a router plugin to an application.
*
**/ 
Router.prototype.attach = function (options) {
  var app = options.app;
  var handlers = options.handlers || this.plugins.router;

  // attached the router.
  Generator.prototype.attach.call(this, options);

  var router = this.router;
  
  // attach the server side component
  _.extend(this.router, {

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
      _.each(router.routes, function (route, key) {

        // add route-level params
        if (route.params) {
          _.each(route.params, addParam);
        }

        var handler = handlers[route.handler];

        if (!_.isFunction(handler)) {
          handler = handlers.constructor.prototype[route.handler];
        }

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
    }

  });

};

module.exports = Router;