var createApp = require('../fixture/app.js');
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
      app.plugins.init(done);
    }
  });


  test('Router plugin should attach', function(done) {
    // console.log(JSON.stringify(app.plugins.router.manifest()));
    assert.ok(app.plugins.router, 'Router interface exists on plugins');
    assert.ok(app.plugins.router.create, 'Router.create interface exists on plugins');
    assert.ok(app.plugins.router.url, 'Router.url interface exists on plugins');
    assert.ok(app.plugins.router.format, 'Router.format interface exists on plugins');

    assert.ok(Object.keys(app.plugins.router.manifest()).length, 6, 'Manifest should contain 6 routes');

    validate_manifest(app.plugins.router.manifest());

    done();
  });

  test('Create router instance', function(done) {

    var router = app.plugins.router.create();
    //console.log(router.manifest());
    assert.ok(router, 'Router instance exists');
    assert.ok(Object.keys(router.manifest()).length, 6, 'Manifest should contain 6 routes');
    assert.equal(typeof(router.dispatch), 'function', 'router.dispatch should be a function.');

    validate_manifest(router.manifest());

    done();
  });

});