var _ = require('lodash');
var tap = require('tap');
var test = tap.test;
var util = require('util');
var server = require('../fixture.js');
var MockRequest = require('hammock').Request;
var MockResponse = require('hammock').Response;

_.each(server.apps, function(app, appid) {
  
  test('Test index route', function(t) {

    var router = app.plugins.router();
    var req = new MockRequest({ url: '/', headers: { host: app.config.hostmap[0] }});
    var res = new MockResponse();

    router.on('error', function(err) {
      console.log(util.inspect(err));
      t.notOk(err, 'Router should not return error.')
    });

    res.on('end', function(err, data) {

      t.notOk(err, 'Response should not return err');
      t.equal(data.body, 'Welcome to ' + app.id + ' search', 'Should return correct body text.');

      t.end();
    });

    router.dispatch(req, res);

  });

 test('Test search route', function(t) { 

    var router = app.plugins.router();
    var uri = app.plugins.router.routes.search.path.replace(':gender', 'male').replace(':age', '6').replace(':claws', 'claws-no').replace(':bark', 'bark-loud');
    var req = new MockRequest({ url: uri, headers: { host: app.config.hostmap[0] }});
    var res = new MockResponse();
    var gold =  app.id == 'dogs'
              ? [{ id: 3, breed: 'chihuahua', gender: 'male', bark: 'loud', age: 6 }]
              : [{ id: 3, breed: 'american shorthair', gender: 'male', claws: 'no', age: 6 }];

    console.log(uri);

    router.on('error', function(err) {
      console.log(util.inspect(err));
      t.notOk(err, 'Router should not return error.')
    });

    res.on('end', function(err, data) {

      var json = JSON.parse(data.body);

      t.notOk(err, 'Response should not return err');
      t.deepEqual(json, gold, 'Should return correct search result.');

      t.end();
    });

    router.dispatch(req, res);

  });


 test('Test single route', function(t) { 

    var router = app.plugins.router();
    var uri = app.plugins.router.routes.single.path.replace(':id', '3');
    var req = new MockRequest({ url: uri, headers: { host: app.config.hostmap[0] }});
    var res = new MockResponse();
    var gold = app.id == 'dogs'
              ? { id: 3, breed: 'chihuahua', gender: 'male', bark: 'loud', age: 6 }
              : { id: 3, breed: 'american shorthair', gender: 'male', claws: 'no', age: 6 };

    console.log(uri);

    router.on('error', function(err) {
      console.log(util.inspect(err));
      t.notOk(err, 'Router should not return error.')
    });

    res.on('end', function(err, data) {

      var json = JSON.parse(data.body);

      t.notOk(err, 'Response should not return err');
      t.deepEqual(json, gold, 'Should return correct individual object result.');

      t.end();
    });

    router.dispatch(req, res);

  });

});