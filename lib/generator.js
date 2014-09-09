var _ = require('lodash');
var url = require('url');
var querystring = require('querystring');

if (typeof(global) === 'undefined') {
  var global = typeof(window) === 'undefined' ? {} : window;
}

var Generator = function() {};

/**
* Attaches a router plugin to an application.
*
**/
Generator.prototype.attach = function (options) {
  var app = options.app;

  /**
  * Initializes the routes for this application
  *
  **/
  var router = this.router || {};

  this.router = _.extend(router, {

    /**
    * Gets a url object for the given route and parameters.  This is where you put your custom route generation.
    * http://nodejs.org/api/url.html#url_url
    **/
    url: function(route, params) {
      params = params || {};

      var uri = url.parse('');
      var routeObject = router.routes[route];

      if (!routeObject) {
        throw new Error('Route not found: ' + route);
      }

      // if these are set on the route, then attach them.  This will allow injection of FQ urls.
      // this will allow polyfill of window object when in a browser.
      var location = global.location || {};
      uri.protocol = routeObject.protocol || location.protocol;
      uri.hostname = routeObject.hostname || location.hostname;
      uri.port = routeObject.hasOwnProperty('port') ? routeObject.port : location.port;
      uri.method = routeObject.method || null;
      uri.auth = routeObject.auth || null;

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

        _.each(queryParams, function (param, key) {

          if (params.hasOwnProperty(key) || param['default']) {
            uri.query = uri.query || {};

            // replace capturing group with value
            var qval = (param.enabled && params.hasOwnProperty(key) && params[key] !== null) ? params[key] : param['default'];
            if (qval) {
              uri.query[key] = param.regex.replace(/\(.*\)/, qval);
            }
          }

        });
      }

      // build the pathname.
      uri.pathname = '';

      // get url segments
      // drop first element in array, since a leading slash creates an empty segment
      var urlSegments = routeObject.path.split('/');
      urlSegments = urlSegments.length > 0 ? urlSegments.slice(1) : urlSegments;

      // replace named params with corresponding values and generate uri
      _.each(urlSegments, function (segment, i) {

        // is this a REST segment?
        if (/^\??:/.test(segment)) {

          // replace with param value if available.
          var pName = segment.replace(/^\??:/, '');
          var pConfig = restParams[pName];

          if (pConfig && pConfig.kind === 'rest') {

            // this is a rest param. replace the capturing group with our value.
            var pval = (pConfig.enabled && params[pName]) ? params[pName] : pConfig['default'];
            if (pval) {
              uri.pathname += '/' + encodeURIComponent(pConfig.regex.replace(/\(.*\)/, pval)).replace(/(%2f)/gi, '/');
            }
          }
        }
        else {

          // just append
          uri.pathname += '/' + segment;
        }
      });

      uri.search = uri.query ? '?' + querystring.stringify(uri.query) : null;
      uri.path = uri.pathname + (uri.search || '');
      uri.host = uri.hostname ?  (uri.hostname + (uri.port && uri.port != 80 ? ':' + uri.port : '')) : null;

      return uri;
    }

    /**
    * Gets a url as a string for the given route and parameters.  This calls url() and stringifies the route.
    *
    **/
  , format: function(route, params, format) {
      var u = router.url(route, params);
      var routeObject = router.routes[route];
      var dotFormat = (_.isUndefined(format)) ? false: ("." + format);

      if (dotFormat) {
    	  u.path += dotFormat;
    	  u.pathname += dotFormat;
      }

      if (routeObject.browser === true || routeObject.browser === 'true') {
        return u.path;
      }

      return url.format(u);
    }
  , routes: options.routes
  , params: options.params

  });

};

module.exports = Generator;
