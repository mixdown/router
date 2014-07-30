var ControllerFactory = require('../lib/controller_factory.js');
var fs = require('fs');
var _ = require('lodash');
var through = require('through2');

module.exports.gulpRouter = function(options) {

  _.defaults(options, {
    router_template: require.resolve('./router_template.js.tpl')
  });

  // ControllerFactory generates the controllers from config.
  var cf = new ControllerFactory(options);
  var module_source = fs.readFileSync(options.router_template, 'utf-8');
  var handlers = [];
  var stream = through.obj();

  // init controllers which crawls and builds manifest
  cf.init(function(err) {
    var code;

    if (err) {
      code = err.stack;
    } else {

      // Iterate and generate router plugin code.
      for (var route_name in cf.controllers) {
        if (cf.controllers[route_name].manifest().browser) {
          handlers.push('"' + route_name + '": require("' + cf.controllers[route_name].dir_path + '/browser_handler.js")');
        }
      }

      // format the string
      code = module_source.replace('/** HANDLERS HERE **/', handlers.join(',\n  '));
    }

    // write and end
    stream.write(code);
    stream.end();

  });

  return stream;
};

module.exports.gulpManifest = function(options) {

  // ControllerFactory generates the controllers from config.
  var cf = new ControllerFactory(options || {});
  var stream = through.obj();

  // init controllers which crawls and builds manifest
  cf.init(function(err) {
    var code;

    if (err) {
      code = err.stack;
    } else {

      var manifest = cf.manifest();
      _.each(manifest, function(m) {
        _.each(m.params, function(p) {
          if (p.regex instanceof RegExp) {
            p.regex = p.regex.source;
          }
        });
      });

      code = 'module.exports = ' + JSON.stringify(manifest) + ';';
    }

    // write and end
    stream.write(code);
    stream.end();

  });

  return stream;
};
