var _ = require('lodash');
var test = require('tape').test;
var server = require('../fixture.js');

_.each(server.apps, function(app, appid) {

  if (app.id === 'dogs') {
  
    test('Test url generation for rest params', function(t) {
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

      t.equal(uri.pathname, gold.pathname, 'Pathname should match the expected url.');
      t.notOk(uri.query, 'Query should not exist.');
      t.equal(url, gold.pathname, 'Formatted url should match expected value.');
      t.end();
    });   

    test('Test url generation for query params', function(t) {
      var params = {
        hidePictures: true,
        id: 1234
      };

      var uri = app.plugins.router.url('single', params);
      var url = app.plugins.router.format('single', params);

      var gold = {
        protocol: 'http',
        host: 'www.foo.com',
        hostname: 'www.foo.com',
        pathname: '/dog/1234',
        query: { hidePictures: 'true' },
        search: '?hidePictures=true',
        path: '/dog/1234?hidePictures=true',

      };
      var goldUrl = 'http://www.foo.com/dog/1234?hidePictures=true';

      t.equal(uri.pathname, gold.pathname, 'Pathname should match the expected url.');
      t.equal(uri.path, gold.path, 'Path should match the expected url.');
      t.deepEqual(uri.query, gold.query, 'Query should match expected object.');
      t.deepEqual(uri.search, gold.search, 'Search should match expected object.');
      t.deepEqual(uri.host, gold.host, 'Host should match expected object.');
      t.deepEqual(uri.hostname, gold.hostname, 'Hostname should match expected object.');
      t.deepEqual(uri.protocol, gold.protocol, 'Protocol should match expected object.');
      t.equal(url, goldUrl, 'Formatted url should match expected value.');
      t.end();
    }); 

  }

  if (app.id === 'cats') {
    test('Test url generation for browser route', function(t) {
      var params = {
        id: 1234
      };

      var uri = app.plugins.router.url('single', params);
      var url = app.plugins.router.format('single', params);

      var gold = {
        protocol: 'http',
        host: 'www.foo.com',
        hostname: 'www.foo.com',
        pathname: '/cat/1234',
        query: null,
        search: null,
        path: '/cat/1234',

      };
      var goldUrl = '/cat/1234';

      t.equal(uri.pathname, gold.pathname, 'Pathname should match the expected url.');
      t.equal(uri.path, gold.path, 'Path should match the expected url.');
      t.notOk(uri.query, 'Query should match expected object.');
      t.deepEqual(uri.search, gold.search, 'Search should match expected object.');
      t.deepEqual(uri.host, gold.host, 'Host should match expected object.');
      t.deepEqual(uri.hostname, gold.hostname, 'Hostname should match expected object.');
      t.deepEqual(uri.protocol, gold.protocol, 'Protocol should match expected object.');
      t.equal(url, goldUrl, 'Formatted url should match expected value.');
      t.end();
    }); 
  }
  
});