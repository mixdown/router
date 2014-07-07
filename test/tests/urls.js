var Router = require('../../index.js');
var assert = require('assert');
var broadway = require('broadway');
var _ = require('lodash');

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


  test('Test url generation for rest params', function(done) {
    var params = {
      age: 6,
      gender: 'female',
      bark: 'loud'
    };

    var uri = app.plugins.router.url('api_v2/dogs_search', params);
    var url = app.plugins.router.format('api_v2/dogs_search', params);
    var gold = {
      pathname: '/dogs/female/bark-loud/6',
      query: null
    };

    assert.equal(uri.pathname, gold.pathname, 'Pathname should match the expected url.');
    assert.equal(uri.query, null, 'Query should not exist.');
    assert.equal(url, gold.pathname, 'Formatted url should match expected value.');
    done();
  });

  test('Test url generation for query params', function(done) {
    var params = {
      hidePictures: true,
      id: 1234
    };

    var uri = app.plugins.router.url('api_v2/dog', params);
    var url = app.plugins.router.format('api_v2/dog', params);

    var gold = {
      protocol: null,
      host: null,
      hostname: null,
      pathname: '/dog/1234',
      query: {
        hidePictures: 'true'
      },
      search: '?hidePictures=true',
      path: '/dog/1234?hidePictures=true',

    };
    var goldUrl = '/dog/1234?hidePictures=true';

    assert.equal(uri.pathname, gold.pathname, 'Pathname should match the expected url.');
    assert.equal(uri.path, gold.path, 'Path should match the expected url.');
    assert.deepEqual(uri.query, gold.query, 'Query should match expected object.');
    assert.equal(uri.search, gold.search, 'Search should match expected object.');
    assert.equal(uri.host, gold.host, 'Host should match expected object.');
    assert.equal(uri.hostname, gold.hostname, 'Hostname should match expected object.');
    assert.equal(uri.protocol, gold.protocol, 'Protocol should match expected object.');
    assert.equal(url, goldUrl, 'Formatted url should match expected value.');
    done();
  });


});