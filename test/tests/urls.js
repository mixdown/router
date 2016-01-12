var createApp = require('../fixture/server/app.js');
var assert = require('assert');
var _ = require('lodash');

suite('Initialization', function () {

  var app;

  setup(function (done) {
    if (app) {
      done();
    } else {
      app = createApp();
      app.setup(done);
    }
  });


  test('Test url generation for rest params', function (done) {
    var params = {
      age: 6,
      gender: 'female',
      bark: 'loud'
    };

    var uri = app.router.url('api_v2/dogs_search', params);
    var url = app.router.format('api_v2/dogs_search', params);
    var gold = {
      pathname: '/api_v2/dogs/female/bark-loud/6',
      query: null
    };

    assert.equal(uri.pathname, gold.pathname, 'Pathname should match the expected url.');
    assert.deepEqual(Object.keys(uri.query), [], 'Query should not exist.');
    assert.equal(url, gold.pathname, 'Formatted url should match expected value.');
    done();
  });

  test('Test url generation for query params', function (done) {
    var params = {
      hidePictures: true,
      id: 1234
    };

    var uri = app.router.url('api_v2/dog', params);
    var url = app.router.format('api_v2/dog', params);

    var gold = {
      protocol: null,
      host: null,
      hostname: null,
      pathname: '/api_v2/dog/1234',
      query: {
        hidePictures: 'true'
      },
      search: '?hidePictures=true',
      path: '/api_v2/dog/1234?hidePictures=true',

    };
    var goldUrl = '/api_v2/dog/1234?hidePictures=true';

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