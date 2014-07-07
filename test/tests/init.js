var Router = require('../../index.js');
var assert = require('assert');
var broadway = require('broadway');
var _ = require('lodash');
var gold_manifest = require('../fixture/gold_manifest.js');

var validate_manifest = function(manifest) {
  _.each(manifest, function(route, name) {

    _.each(route, function(v, k) {
      assert.deepEqual(v, gold_manifest[name][k], 'Manifest should be correct for route: ' + name + '[' + k + ']');
    });

  });
};

suite('Initialization', function() {

  var app = {
    plugins: new broadway.App()
  };

  var initComplete = false; // to prevent re-init on multiple tests since each test uses same instance.

  setup(function(done) {

    if (!initComplete) {
      app.plugins.use(new Router(), {
        timeout: 3000, // 3s timeout
        paths: [{
          path: './test/fixture/controllers/api_v1',
          url_prefix: '/api/v1'
        }, {
          path: './test/fixture/controllers/api_v2'
        }, {
          path: './test/fixture/controllers/pages',
          url_prefix: '',
          add_namespace: false
        }]
      });

      // app.plugins.router.on('no-browser-handler', function(data) {
      //   console.log(data);
      // });

      app.plugins.router.on('invalid-route', function(data) {
        console.log(data, data.err.stack);
      });


      app.plugins.init(done);
      initComplete = true;
    } else {
      done();
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