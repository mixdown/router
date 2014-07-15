var createApp = require('../fixture/app.js');
var assert = require('assert');
var querystring = require('querystring');
var _ = require('lodash');
var Request = require('hammock').Request;
var Response = require('hammock').Response;

suite('Dispatch', function() {

  var app;

  setup(function(done) {
    if (app) {
      done();
    } else {
      app = createApp();
      app.setup(done);
    }
  });

  test('Get Page', function(done) {
    var req = new Request({
      url: app.router.format('home')
    });
    var res = new Response();
    var router = app.router.create();

    res.on('end', function(err, data) {
      console.log(data.body);
      assert.equal(res.statusCode, 200, 'Response should not return err');
      assert.equal(data.body, 'boxer,boston terrier,chihuahua,poodle', 'Should return correct body text.');
      done();
    });

    router.dispatch(req, res);
  });

  test('Test search GET', function(done) {

    var params = {
      age: 2,
      gender: 'male',
      bark: 'loud'
    };

    var gold = [{
      id: 1,
      breed: 'boxer',
      gender: 'male',
      bark: 'loud',
      age: 2
    }, {
      id: 3,
      breed: 'chihuahua',
      gender: 'male',
      bark: 'loud',
      age: 2
    }];

    var req = new Request({
      url: app.router.format('api_v2/dogs_search', params)
    });
    var res = new Response();
    var router = app.router.create();

    // console.log(req.url);

    // router.on('handle-route', function(httpContext) {
    //   console.log(httpContext);
    // });

    res.on('end', function(err, data) {
      // console.log(data.body);
      assert.equal(res.statusCode, 200, 'Response should not return err');
      assert.deepEqual(JSON.parse(data.body), gold, 'Should return correct search result.');
      done();
    });

    router.dispatch(req, res);

  });

  test('Test DELETE', function(done) {

    var params = {
      id: 3
    };

    var gold = {
      ok: true,
      id: 3
    };

    var req = new Request({
      url: app.router.format('api_v2/dog', params),
      method: 'DELETE'
    });
    var res = new Response();
    var router = app.router.create();

    res.on('end', function(err, data) {
      console.log(data.body);
      assert.equal(res.statusCode, 200, 'Response should not return err');
      assert.deepEqual(JSON.parse(data.body), gold, 'Should return correct search result.');
      done();
    });

    router.dispatch(req, res);

  });

  test('Test PUT w/ urlencoding body', function(done) {
    var id = Math.ceil(Math.random() * 10000);
    var gold = {
      ok: true,
      id: id
    };

    var req = new Request({
      url: app.router.format('api_v2/dog'),
      method: 'PUT',
      headers: {
        'content-type': 'application/www-urlencoded'
      }
    });
    console.log(req.url);

    var res = new Response();
    var router = app.router.create();

    res.on('end', function(err, data) {
      console.log(data.body);
      assert.equal(res.statusCode, 200, 'Response should not return err');
      assert.deepEqual(JSON.parse(data.body), gold, 'Should return correct result.');
      done();
    });

    router.dispatch(req, res);
    req.write(querystring.stringify({
      id: id
    }));
    req.end();

  });

  test('Test POST w/ json encoded body', function(done) {
    var id = Math.ceil(Math.random() * 10000);
    var gold = {
      ok: true,
      id: id
    };

    var req = new Request({
      url: app.router.format('api_v2/dog'),
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    });
    console.log(req.url);

    var res = new Response();
    var router = app.router.create();

    res.on('end', function(err, data) {
      console.log(data.body);
      assert.equal(res.statusCode, 200, 'Response should not return err');
      assert.deepEqual(JSON.parse(data.body), gold, 'Should return correct result.');
      done();
    });

    router.dispatch(req, res);
    req.write(JSON.stringify({
      id: id
    }));
    req.end();

  });
});