var url = require('url');
var Uuid = require('uuid');

var HttpContext = function(req, res) {

  // Factory support
  if (!(this instanceof HttpContext)) {
    return new HttpContext(req, res)
  }

  this.request = req;
  this.response = res;
  this.body = null;
  this.params = {};
  this.id = Uuid.create();
  this.user = null;

  this.url = url.parse(req.url, true, true);
};

module.exports = HttpContext;