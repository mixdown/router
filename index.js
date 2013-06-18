var _ = require('lodash');
var plRouter = require('pipeline-router');
var util = require('util');
var url = require('url');
var querystring = require('querystring');

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
      
      var addParam = function (param, key) {
        if (!param || !param.regex) {
          throw new Error('regex missing for param: ' + key);
        }
        else if (!param.kind) {
          throw new Error('kind missing for param: ' + key);
        }

        if (param.kind === "rest") {
          newRouter.param(key, new RegExp(param.regex));
        }
        else if (param.kind === 'query') {
          newRouter.qparam(key, new RegExp(param.regex));
        }
        else {
          throw new Error('unknown param type: ' + param.kind);
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
      var routeObject = router.routes[route];

      // if these are set on the route, then attach them.  This will allow injection of FQ urls.
      uri.protocol = routeObject.protocol || null;      
      uri.hostname = routeObject.hostname || null;      
      uri.port = routeObject.port || null;

      // map the param fields to querystring as defined in route.
      var queryParams = {};
      var restParams = {};

      // split params into rest/query
      _.each(routeObject.params, function (param, key) {
        if (param.kind === 'rest') {
          restParams[key] = param;
        }
        else if (param.kind === 'query') {
          queryParams[key] = param;
        }
      });

      if (!_.isEmpty(queryParams)) {
        uri.query = {};

        _.each(queryParams, function (param, key) {
          if (params[key]) {
            // replace capturing group with value
            uri.query[key] = param.regex.replace(/\(.*\)/, params[key]);
          }
        });
      }

      // build the pathname.  
      uri.pathname = '';    
      
      // get url segments
      // drop first element in array, since a leading slash creates an empty segment
      var urlSegments = _.rest(routeObject.path.split('/'));

      // replace named params with corresponding values and generate uri
      _.each(urlSegments, function (segment, i) {
        // is this a REST segment?
        if (/^\??:/.test(segment)) {
          // replace with param value if available.
          var pName = segment.replace(/^\??:/, '');
          var pConfig = restParams[pName];

          if (pConfig && pConfig.kind === 'rest') {
            // this is a rest param. replace the capturing group with our value.
            uri.pathname += '/' + pConfig.regex.replace(/\(.*\)/, params[pName]);
          }
        }
        else {
          // just append
          uri.pathname += '/' + segment;
        }
      });

      uri.search = uri.query ? '?' + querystring.stringify(uri.query) : null;
      uri.path = uri.pathname + (uri.search || '');
      uri.host = uri.hostname ?  (uri.hostname + (uri.port ? ':' + uri.port : '')) : null;

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
};

module.exports = Router;