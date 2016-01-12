var formidable = require('formidable');
var mkdirp = require('mkdirp');
var fs = require('fs');
var util = require('util');
var path = require('path');
var events = require('events');
var HttpContext = require('./http_context.js');
var async = require('async');

var Router = function (options) {
  var self = this;

  this.controllers = options.controllers;
  this.uploadDir = '';
  this.parsed = false;
  this.timeout = options.timeout;
  this.app = options.app;

  try {
    this.uploadDir = options.file_upload_path || path.join(process.cwd(), '/tmp/fileuploads');
  } catch (e) {}


  this.on('body', function () {
    self.parsed = true;
  });

};

util.inherits(Router, events.EventEmitter);

Router.prototype.manifest = function () {
  return this.controllers.manifest();
};

// To be implemented in child classes.
Router.prototype._authenticate = function (httpContext, callback) {

  httpContext.user = {
    logged_in: false
  };

  callback(null, httpContext);
};

// To be implemented in child classes
Router.prototype._authorize = function (httpContext, callback) {

  callback(null, httpContext);
};

Router.prototype.reset = function () {
  this.params = [];
  this.query = null;
  this.parsed = false;
  this.httpContext = null;
};

Router.prototype.dispatch = function (request, response) {
  var self = this;

  var httpContext = this.httpContext = new HttpContext(request, response);
  httpContext.app = this.app;

  // parse body on post
  if (/(POST|PUT|DELETE)/i.test(httpContext.request.method) && /(urlencoded|json|multipart\/form-data)/i.test(httpContext.request.headers['content-type'])) {
    this.parseForm();
  } else {
    this.parsed = true;
  }

  // now find the controller and send to handler
  var controller = this.controllers.find(httpContext);

  if (!controller) {
    self.emit('not_found', new Error('Route Not Found: ' + httpContext.request.url), httpContext);
    self.emit('end', new Error('Route Not Found'), httpContext);
    return;
  }

  httpContext.route = controller.name;
  httpContext.controller = controller;
  controller.parse(httpContext);
  self.emit('match', httpContext);

  var ops = [

    // authenticate: if route needs authentication, then run it.
    function (cb) {
      if (controller.authenticate !== false) {
        self._authenticate(httpContext, function (err) {
          cb(err, err == null);
        });
      } else {
        cb(null, true);
      }
    },

    // authorize: if route asks for role checking, then run it.
    function (cb) {
      if (controller.authenticate !== false && typeof (controller.authorize) !== 'undefined') {
        self._authorize(httpContext, function (err) {
          cb(err, err == null);
        });
      } else {
        cb(null, true);
      }
    },

    // execute: check that body is parsed and emit handle event.
    function (cb) {
      self.emit('handle-route', httpContext);

      if (!self.parsed) {
        self.on('body', function () {
          cb();
        });
      } else {
        cb();
      }
    }

  ];

  async.series(ops, function (err, results) {
    var authenticate_error = err && results[0] === false;
    var authorize_error = err && results[1] === false;

    // if we failed on auth, then send error
    if (authenticate_error) {

      if (httpContext.app.error) {
        httpContext.app.error.notAuthenticated(err, httpContext);

      } else {
        httpContext.response.statusCode = 401;
        httpContext.response.end(err.stack);
      }

    } else if (authorize_error) {

      if (httpContext.app.error) {
        httpContext.app.error.notAuthorized(err, httpContext);

      } else {
        httpContext.response.statusCode = 403;
        httpContext.response.end(err.stack);
      }

    } else {

      // actually execute the handler.
      try {
        controller.handle(httpContext);
      } catch (e) {
        err = e;
        self.emit('error', e, httpContext);
      }

    }

    self.emit('end', err, httpContext);

  });


};

Router.prototype.parseForm = function () {
  var self = this;
  var httpContext = this.httpContext;

  if (/(urlencoded|json|multipart\/form-data)/i.test(httpContext.request.headers['content-type'])) {

    var form = new formidable.IncomingForm();

    if (!fs.existsSync(self.uploadDir)) {
      mkdirp.sync(self.uploadDir);
    }

    form.uploadDir = self.uploadDir;

    form.on('field', function (field, value) {
      httpContext.body = httpContext.body || {};
      if (httpContext.body[field] && Array.isArray(httpContext.body[field])) {
        httpContext.body[field].push(value);
      } else if (httpContext.body[field]) {
        httpContext.body[field] = [httpContext.body[field]];
        httpContext.body[field].push(value);
      } else {
        httpContext.body[field] = value;
      }
    });

    form.on('error', function (err) {
      httpContext.body = err;
      self.emit('body', err);
    });

    form.on('file', function (name, file) {
      httpContext.files = httpContext.files || [];
      httpContext.files.push({
        name: file.name,
        file: file
      });
    });

    form.on('end', function () {
      self.emit('body', httpContext.body);
    });

    form.parse(httpContext.request);
  } else {
    httpContext.body = [];

    httpContext.request.on('data', function (chunk) {
      httpContext.body.push(chunk);
    });

    httpContext.request.on('end', function () {
      httpContext.body = Buffer.concat(httpContext.body);
      self.emit('body', httpContext.body);
    });

  }
};

module.exports = Router;
