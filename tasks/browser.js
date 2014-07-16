var ControllerFactory = require('../lib/controller_factory.js');
var fs = require('fs');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerTask('mixdown-router', 'Generates client (browser) controller code from mixdown-router.', function() {
    // Tell Grunt this task is asynchronous.
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      dest: './browser_controllers.js',
      router_template: './tasks/router_template.js.tpl'
    });

    // ControllerFactory generates the controllers from config.
    var cf = new ControllerFactory(options);
    var module_source = grunt.file.read(options.router_template);
    var handlers = [];

    // init controllers which crawls and builds manifest
    cf.init(function(err) {
      if (err) {
        grunt.fail.error('Controllers init() failed', err);
        done(err);
        return;
      }

      // Iterate and generate router plugin code.
      for (var route_name in cf.controllers) {
        if (cf.controllers[route_name].manifest().browser) {
          handlers.push(route_name + ': require("' + cf.controllers[route_name].dir_path + '/browser_handler.js")');
        }
      }

      // format the string
      var src = module_source.replace('/** HANDLERS HERE **/', handlers.join(',\n  '));

      // Write the destination file.
      grunt.file.write(options.dest, src);
      done();
    });

  });

};