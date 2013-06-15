var _ = require('lodash');
var plRouter = require('pipeline-router');
var util = require('util');
var url = require('url');

var Router = function() {
  this.name = 'router';
};

var baseHandler = function() {
  var handler = Array.prototype.slice.call(arguments, 0)[0];
  var httpContext = Array.prototype.slice.call(arguments, 1)[0];

  var context = _.clone(httpContext);
  context.app = this;

  handler.call(context, context);

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
  var router = this.router = {

    /**
    * Creates a new instance of router.
    *
    **/
    create: function() {
      var newRouter = new plRouter();

      _.each(options.params, function(regex, key) {
        newRouter.param(key, new RegExp(regex));
      });

      _.each(options.routes, function(route, key) {

        var handler = handlers[route.handler];
        if (!_.isFunction(handler)) {
          handler = handlers.constructor.prototype[route.handler];
        }

        if (_.isFunction(handler)) {
          newRouter.use(route.method, route.path, _.bind(baseHandler, app, handler));
        }

      });

      return newRouter;
    }

    /**
    * Gets a url object for the given route and parameters.  This is where you put your custom route generation.
    * http://nodejs.org/api/url.html#url_url
    **/
  , url: function(route, params) {
      var uri = url.parse('');
      var routeObject = options.routes[route];

      // if these are set on the route, then attach them.  This will allow injection of FQ urls.
      uri.hostname = routeObject.hostname;      
      uri.port = routeObject.port;

      // map the param fields to querystring as defined in route.
      if (routeObject.query) {
        uri.query = {};

        _.each(routeObject.query, function(q) {

          if (params[q] !== null ) {
            uri.query[q] = params[q];
          }
        });
      }

      // build the pathname.  
      uri.pathname = '';    
      var regexSplit = /(\?|\/)([^\?^\/]+)/g;
      var restParams = routeObject.path.match(regexSplit);

      if (!restParams || restParams.length === 0) {
          restParams = [routeObject.path];
      }

      // replace named params with corresponding values and generate uri
      _.each(restParams, function(str, i) {
          var paramConfig = null;

          // find the corresponding parameter in param list.
          _.each(options.params, function(rx, name) { 
            if (!paramConfig && str.substring(1) === ':' + name) {
              paramConfig = {
                name: name,
                format: rx
              };
            }
          });

          // now that we have the param spec, we can put the value in the format string.
          if (paramConfig) {
            var val = params[paramConfig.name];
            uri.pathname += '/' + paramConfig.format.replace(/\(.*\)/, val);
          }
          else {
            uri.pathname += str;
          }
      });

      return uri;
    }

    /**
    * Gets a url as a string for the given route and parameters.  This calls url() and stringifies the route.
    *
    **/
  , format: function(route, params) {
    return url.format(router.url(route, params));
  }
  , routes: options.routes
  , params: options.params

  };
  this.router.routes = options.routes;
  this.router.params = options.params;
};

module.exports = Router;