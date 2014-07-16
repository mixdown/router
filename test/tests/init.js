var createApp = require('../fixture/server/app.js');
var assert = require('assert');
var _ = require('lodash');
var gold_manifest = require('../fixture/gold_manifest.js');

var validate_manifest = function(manifest) {
  _.each(manifest, function(route, name) {

    _.each(route, function(v, k) {

      if (k === 'params') {
        _.each(v, function(pv, pk) {
          if (pk === 'regex') {
            assert.deepEqual(pv.source, v[pk], 'Manifest should be correct for route: ' + name + '.params[' + pk + ']');
          } else {
            assert.deepEqual(pv, v[pk], 'Manifest should be correct for route: ' + name + '.params[' + pk + ']');
          }
        });
      } else if (k === 'browser_handler') {
        assert.ok(typeof(v), 'function', 'Manifest should be correct for route: ' + name + '[' + k + ']');
      } else {
        assert.deepEqual(v, gold_manifest[name][k], 'Manifest should be correct for route: ' + name + '[' + k + ']');
      }

    });

  });
};

suite('Initialization', function() {

  var app;

  setup(function(done) {
    if (app) {
      done();
    } else {
      app = createApp();
      app.setup(done);
    }
  });


  test('Router plugin should attach', function(done) {
    // console.log(JSON.stringify(app.router.manifest()));
    assert.ok(app.router, 'Router interface exists on plugins');
    assert.ok(app.router.create, 'Router.create interface exists on plugins');
    assert.ok(app.router.url, 'Router.url interface exists on plugins');
    assert.ok(app.router.format, 'Router.format interface exists on plugins');

    assert.ok(Object.keys(app.router.manifest()).length, 6, 'Manifest should contain 6 routes');

    // var ws = (require('fs')).createWriteStream((require('path')).join(process.cwd(), 'out.js'));
    // ws.write(app.router.manifest(true));
    // ws.end();
    validate_manifest(app.router.manifest());

    done();
  });

  test('Create router instance', function(done) {

    var router = app.router.create();
    //console.log(router.manifest());
    assert.ok(router, 'Router instance exists');
    assert.ok(Object.keys(router.manifest()).length, 6, 'Manifest should contain 6 routes');
    assert.equal(typeof(router.dispatch), 'function', 'router.dispatch should be a function.');

    validate_manifest(router.manifest());

    done();
  });

});