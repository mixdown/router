var _ = require('lodash');
var async = require('async');
var path = require('path');
var fs = require('fs');
var Controller = require('./controller.js');
var events = require('events');
var util = require('util');
var JSONfn = require('json-fn');

var file_conventions = {
  browser: './browser_handler.js',
  route: './route.js'
};

// options.paths: {Array[String]} file path to controllers.  if an entry is a folder, then it will be searched.  default: "./controllers"
var ControllerFactory = function(options) {

  if (!(this instanceof ControllerFactory)) {
    return new ControllerFactory(options);
  }

  this._manifest = {
    raw: null,
    json: {}
  };
  this.default_timeout = options.timeout;

  if (options.routes) {
    this.routes = options.routes;
  } else if (!options.paths || options.paths.length === 0) {
    throw new Error('paths not defined for Controllers');
  } else {
    this.paths = _.map(options.paths, function(p) {
      _.defaults(p, {
        add_namespace: true
      });

      if (p.add_namespace && !p.url_prefix) {
        p.url_prefix = path.basename(p.path);
      }

      return p;
    });
  }
};

util.inherits(ControllerFactory, events.EventEmitter);

ControllerFactory.prototype.init = function(done) {
  var self = this;

  if (this.paths) {
    this.load_manifest(done);
  } else {

    if (typeof(this.routes) === 'string') {
      this._manifest.json = JSONfn.parse(this.routes);
      this._manifest.raw = this.routes;
    } else {
      this._manifest.raw = JSONfn.stringify(this.routes);

      _.each(this.routes, function(v, k) {
        if (self.routes[k].hasOwnProperty('browser_handler')) {
          self.routes[k].browser_handler = eval('(' + self.routes[k].browser_handler + ')');
        }
      });

      this._manifest.json = this.routes;
    }

    // load the controllers from the config.
    this.controllers = {};
    _.each(this._manifest.json, function(route_config, route_name) {
      self.controllers[route_name] = new Controller(route_config);
    });

    done();
  }
};

ControllerFactory.prototype.manifest = function(raw) {
  if (raw) {
    return this._manifest.raw;
  }
  return this._manifest.json;
};

ControllerFactory.prototype._crawl = function(file_path, callback) {

  var controllersPath = path.join(process.cwd(), file_path.path);
  var self = this;
  var controllers = {};

  // check for path
  fs.exists(controllersPath, function(exists) {

    if (!exists) {

      // if the user specifically defined the path, then throw error.  Otherwise, this is an optimistic search for the default path so it is not an error.
      var err = definedPath ? new Error('Controllers path does not exist.  path: ' + controllersPath) : null;
      callback(err);
      return;
    }

    // Load all the services from the folder.
    fs.readdir(controllersPath, function(err, files) {

      // get stats for all sub-folders.
      var ops = _.map(files, function(file) {
        return function(cb) {

          var full_path = path.join(controllersPath, file);

          fs.stat(full_path, function(err, stats) {

            cb(null, _.extend(stats, {
              namespace: file_path.add_namespace ? path.basename(controllersPath) : null,
              file: file,
              full_path: full_path,
              url_prefix: file_path.url_prefix
            }));
          });

        };
      });

      // filter the valid folders for controllers.
      async.parallel(ops, function(err, results) {

        // ensure we are only loading from directories.
        var cdirs = _.filter(results, function(file_stats) {
          return file_stats.isDirectory();
        });


        // generate new controllers for each directory.
        _.each(cdirs, function(dir) {

          // Load 3 files, then generate rawController config.
          var browser_handler;
          var rconfig;
          var tmp_path;

          tmp_path = path.join(dir.full_path, file_conventions.browser);
          try {
            browser_handler = require(tmp_path);
          } catch (e) {
            // This is options, but emit no-browser-handler event for hooking logs or something.
            self.emit('no-browser-handler', {
              path: tmp_path,
              directory: dir,
              segment: file_conventions.route,
              err: e
            });
          }

          tmp_path = path.join(dir.full_path, file_conventions.route);
          try {
            rconfig = require(tmp_path);
          } catch (e) {
            // This is required so emit invalid-route event for hooking logs or something.
            self.emit('invalid-route', {
              path: tmp_path,
              directory: dir,
              segment: file_conventions.route,
              err: e
            });
          }

          if (rconfig) {

            // raw config is a merge of the 3 configs.
            // route config (json) & server handlers (get,post,put,delete)
            var route_config = _.clone(rconfig);

            route_config.timeout = route_config.timeout || self.default_timeout;

            if (browser_handler) {
              route_config.browser_handler = browser_handler; // attach browser handler if declared.
            }

            if (dir.url_prefix) {
              route_config.path = dir.url_prefix + route_config.path;
            }

            // load the controllers hash.
            var route_name = (dir.namespace === null ? '' : dir.namespace + '/') + dir.file;
            route_config.name = route_name;
            route_config.dir_path = dir.full_path;
            controllers[route_name] = new Controller(route_config);
          }

        });

        // in case someone was listening.
        callback(err, controllers);
      });

    });
  });
};

ControllerFactory.prototype.crawl = function(callback) {
  var self = this;

  var ops = _.map(this.paths, function(p) {
    return self._crawl.bind(self, _.clone(p));
  });

  async.parallel(ops, function(err, results) {
    if (err) {
      callback(err);
      return;
    }

    self.controllers = {};

    _.each(results, function(controller_list) {
      _.extend(self.controllers, controller_list);
    });

    callback(null, self.controllers);
  });
};

// Crawl the file system and build a search tree.
ControllerFactory.prototype.load_manifest = function(callback) {
  var self = this;

  this.crawl(function(err) {

    self._manifest = {
      raw: null,
      json: {}
    };

    _.each(self.controllers, function(c, name) {
      self._manifest.json[name] = c.manifest();
    });

    self._manifest.raw = JSONfn.stringify(self._manifest.json);

    callback(err, self._manifest);
  });
};

// Find a matching route.
ControllerFactory.prototype.find = function(httpContext) {

  // Loop through controllers.  TODO: consider a future release using a search tree for evaluating routes.
  for (var key in this.controllers) {
    if (this.controllers[key].evaluate(httpContext.url.pathname)) {
      return this.controllers[key];
    }
  }
};

module.exports = ControllerFactory;