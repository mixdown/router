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
        pathname: '/dog/1234',
        query: { hidePictures: true }
      };
      var goldUrl = '/dog/1234?hidePictures=true';

      t.equal(uri.pathname, gold.pathname, 'Pathname should match the expected url.');
      t.deepEqual(uri.query, gold.query, 'Query should match expected object.');
      t.equal(url, goldUrl, 'Formatted url should match expected value.');
      t.end();
    }); 
  }
  
});