var _ = require('lodash');
var verbs = ['get', 'post', 'put', 'delete'];
var non_manifest_properties = ['browser_handler'];
var manifest_properties = ['authenticate', 'name', 'path', 'timeout', 'description', 'params'];
var controller_properties = non_manifest_properties.concat(verbs.concat(manifest_properties));
var parse_params = require('./parse_params.js');

var Controller = function(rawController) {

  if (!(this instanceof Controller)) {
    return new Controller(rawController);
  }

  // apply properties from raw controller export.
  _.extend(this, _.pick(rawController, controller_properties));

  this.timeout = this.timeout || 120000; // node.js default

  // parse and attach urlformat
  this.restParams = _.filter(this.params, function(p) {
    return p.type === 'rest';
  });

  this.queryParams = _.filter(this.params, function(p) {
    return p.type === 'query';
  });

  this.urlformat = parse_params(this.path, this.restParams);

};

Controller.prototype.evaluate = function(strUrl) {
  return this.urlformat.test(strUrl);
};

Controller.prototype.parse = function(httpContext) {

  // LOAD httpContext.params

  var urlParams = url.split('/');
  var parsedParams = {};

  if (urlParams[0] === "") {
    urlParams.splice(0, 1);
  }

  // validate and attach rest params.
  _.each(this.restParams, function(pmap, i) {
    var param = urlParams[i];
    if (param && pmap) {
      var m = pmap.regex.exec(param);
      if (m) {
        parsedParams[pmap.name] = decodeURIComponent(_.last(m));
      }
    }
  });

  // validate and attach blessed query params.  Non-declared will still exist on httpContext.url.
  _.each(this.queryParams, function(p, name) {
    if (p.regex.test(httpContext.url.query[name])) {
      httpContext.params[name] = httpContext.url.query[name];
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

  if (typeof(this[method]) === 'function') {
    this[method].call(httpContext.app, httpContext);
  } else {
    throw new Error(this.name + ' Controller does not support http verb ' + method.toUpperCase());
  }

  return httpContext;
};

module.exports = Controller;