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

      var code_buf = [];

      var manifest = cf.manifest();
      _.each(manifest, function(m) {
        var cnt = 0;

        s_buf = ['{'];

        _.each(m, function(v, k) {

          // convert params
          if (k === 'params') {
            _.each(v, function(p) {
              if (p.regex instanceof RegExp) {
                p.regex = p.regex.source;
              }
            });
          }

          if (cnt++ > 0) {
            s_buf.push(',');
          }

          s_buf.push('"' + k + '":');
          if (typeof(v) === 'function') {
            s_buf.push(v.toString());
          } else if (typeof(v) === 'undefined') {
            s_buf.push("null");
          } else {
            s_buf.push(JSON.stringify(v));
          }

        });



        s_buf.push('}');

        code_buf.push('"' + m.name + '": ' + s_buf.join(''));
      });

      code = 'module.exports = {' + code_buf.join(',') + '};';

    }

    // write and end
    stream.write(code);
    stream.end();

  });

  return stream;
};