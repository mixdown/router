var _ = require('lodash');
var verbs = ['get', 'post', 'put', 'delete'];
var non_manifest_properties = ['browser_handler', 'dir_path'];
var manifest_properties = ['authenticate', 'authorize', 'name', 'path', 'timeout', 'description', 'params', 'browser', 'cache_buster'];
var controller_properties = non_manifest_properties.concat(verbs.concat(manifest_properties));
var parse_params = require('./parse_params.js');

var Controller = function(rawController) {

  if (!(this instanceof Controller)) {
    return new Controller(rawController);
  }

  // apply properties from raw controller export.
  _.extend(this, _.pick(rawController, controller_properties));

  this.path = this.path || '/';

  this.timeout = this.timeout || 120000; // node.js default

  var self = this;

  // parse and attach urlformat
  restHash = {};
  this.queryParams = {};

  _.each(this.params, function(p, name) {

    p.name = name; //set this so it is accessible inside the param spec.

    if (p.kind === 'rest') {
      restHash[name] = p;
    } else if (p.kind === 'query') {
      p.regex = new RegExp(p.regex);
      self.queryParams[name] = p;
    }
  });

  // ensure starts with slash.
  if (this.path[0] !== '/') {
    this.path = '/' + this.path;
  }

  var parsed_params = parse_params(this.path, restHash);
  this.urlformat = parsed_params.urlformat;
  this.restParams = parsed_params.restParams;

};

Controller.prototype.evaluate = function(strUrl) {
  return this.urlformat.test(strUrl);
};

Controller.prototype.parse = function(httpContext) {

  // LOAD httpContext.params

  // validate and attach blessed query params.  Non-declared will still exist on httpContext.url.
  _.each(this.queryParams, function(p, name) {
    if (typeof(httpContext.url.query[name]) !== 'undefined' && p.regex.test(httpContext.url.query[name])) {
      httpContext.params[name] = httpContext.url.query[name];
    } else if (p['default']) {
      httpContext.params[name] = p['default'];
    }
  });


  var urlParams = httpContext.url.pathname.split('/');

  if (urlParams[0] === "") {
    urlParams.splice(0, 1);
  }

  // validate and attach rest params.
  _.each(this.restParams, function(pmap, i) {
    var param = urlParams[i];
    if (param && pmap) {
      var m = pmap.regex.exec(param);
      if (m) {
        httpContext.params[pmap.name] = decodeURIComponent(_.last(m));
      }
    }
  });

  // return context.
  return httpContext;
};

Controller.prototype.manifest = function() {
  var self = this;
  var manifest_entry = _.pick(this, manifest_properties);

  // return boolean noting whether this supports each verb.
  _.each(verbs, function(v) {
    manifest_entry[v] = self.hasOwnProperty(v);
  });

  manifest_entry.browser = (typeof(this.browser_handler) === 'function');

  return manifest_entry;
};


Controller.prototype.handle = function(httpContext) {
  var method = httpContext.request.method.toLowerCase();

  // if browser, then handle
  if (typeof(window) !== 'undefined' && this.browser) {
    this.browser_handler.call(httpContext.app, httpContext)

  } else if (typeof(window) !== 'undefined' && window.location.href !== httpContext.request.url) {
    window.location.href = httpContext.request.url;

  } else if (typeof(this[method]) === 'function') {
    this[method].call(httpContext.app, httpContext);

  } else {
    throw new Error(this.name + ' Controller does not support http verb ' + method.toUpperCase());
  }

  return httpContext;
};

module.exports = Controller;