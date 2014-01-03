var Router = require('../fixture/router.js');
var assert = require('assert');
var broadway = require('broadway');
var routes = require('../fixture/routes.json');
var _ = require('lodash');

suite('Initialization', function() {

  var app = {
    plugins: new broadway.App()
  };

  setup(function(done) {

    app.plugins.use(new Router(), {
      timeout: 3000,  // 3s timeout
      routes: routes
    });

    app.plugins.init(done);
  });


  test('Test url generation for rest params', function(done) {
    var params = {
      age: 6,
      gender: 'female',
      bark: 'loud'
    };

    var uri = app.plugins.router.url('search', params);
    var url = app.plugins.router.format('search', params);
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

    var uri = app.plugins.router.url('single', params);
    var url = app.plugins.router.format('single', params);

    var gold = {
      protocol: null,
      host: null,
      hostname: null,
      pathname: '/dog/1234',
      query: { hidePictures: 'true' },
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
