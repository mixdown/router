var url = require('url');
var uuid = require('uuid');
var useragent = require('express-useragent');

var HttpContext = function(req, res) {

  // Factory support
  if (!(this instanceof HttpContext)) {
    return new HttpContext(req, res)
  }

  this.app;
  this.request = req;
  this.response = res;
  this.body = {};
  this.params = {};
  this.id = uuid.v4();
  this.user = null;
  this.route = null; // name of matched route
  this.controller = null; // instance of matched controller.

  this.url = url.parse(req.url, true, true);

  try {
    this.user_agent = useragent.parse(this.request.headers['user-agent'] || '');
  } catch (e) {
    this.user_agent = null;
  }

};

module.exports = HttpContext;
