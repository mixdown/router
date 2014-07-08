var _ = require('lodash');
var ControllerFactory = require('./lib/controller_factory.js');
var Router = require('./lib/router.js');
var Generator = require('./lib/generator.js');
var events = require('events');

var RouterPlugin = function(namespace) {
  namespace = namespace || 'router';

  var self;
  var that = this; // yuck;
  var controllers;
  var generator;

  this.attach = function(options) {

    self = this[namespace] = new events.EventEmitter();
    controllers = new ControllerFactory(options);

    // attach the generator part of the router.
    var gen = new Generator(namespace);
    gen.attach.call(this, options);

    // creates a router instance.
    self.create = function() {
      return new Router({
        controllers: controllers,
        timeout: options.timeout
      });
    };

    // Functions that use the route table and controller manifest.
    self.manifest = _.bind(controllers.manifest, controllers);

    // bubble both events 
    controllers.on('invalid-route', function(data) {
      self.emit('invalid-route', data);
    });

    // bubble both events 
    controllers.on('no-browser-handler', function(data) {
      self.emit('no-browser-handler', data);
    });
  };

  this.init = function(done) {
    controllers.init(done);
  };

};

module.exports = RouterPlugin;