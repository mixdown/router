var _ = require('lodash');
var plRouter = require('pipeline-router');
var util = require('util');

var Router = function() {
  this.name = 'router';
};

var baseHandler = function() {
  var handler = Array.prototype.slice.call(arguments, 0)[0];
  var req = Array.prototype.slice.call(arguments, 1)[0];
  var res = Array.prototype.slice.call(arguments, 2)[0];

  var context = {
    app: this,
    req: req,
    res: res
  };

  handler.call(context, req.params);

};

/**
* Attaches an autos router plugin to an application.
*
**/ 
Router.prototype.attach = function (options) {
  var app = options.app;
  var handlers = options.handlers || this.plugins.router;

  /**
  * Initializes the routes for this application
  *
  **/
  this.router = function() {
    var router = new plRouter();

    _.each(options.params, function(regex, key) {
      router.param(key, new RegExp(regex));
    });

    _.each(options.routes, function(route, key) {

      var handler = handlers[route.handler];
      if (!_.isFunction(handler)) {
        handler = handlers.constructor.prototype[route.handler];
      }

      if (_.isFunction(handler)) {
        router.use(route.method, route.path, _.bind(baseHandler, app, handler));
      }

    });

    return router;
  };

  this.router.routes = options.routes;
  this.router.params = options.params;
};

module.exports = Router;