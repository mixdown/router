var url = require('url');
var uuid = require('node-uuid');
var useragent = require('express-useragent');

var HttpContext = function(req, res) {

  // Factory support
  if (!(this instanceof HttpContext)) {
    return new HttpContext(req, res)
  }

  this.request = req;
  this.response = res;
  this.body = {};
  this.params = {};
  this.id = uuid.v4();
  this.user = null;
  this.route = null;

  this.url = url.parse(req.url, true, true);
  this.user_agent = useragent.parse(this.request.headers['user-agent'] || '');

};

module.exports = HttpContext;