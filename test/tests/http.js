var assert = require('assert');
var _ = require('lodash');
var util = require('util');
var http = require('http');
var server = require('../fixture/server.js');

suite('Initialization', function() {

  var app = null;

  setup(function(done) {
    if (app) {
      done();
      return;
    }

    server.start(function(err, data) {
      app = data.app;

      done(err);
    });

  });


  test('Test index route', function(done) {

    http.get('http://localhost:8081' + app.plugins.router.format('home'), function(res) {
      var body = [];

      res.on('data', function(chunk) {
        body.push(chunk);
      });

      res.on('end', function() {
        body = body.join('');

        assert.equal(res.statusCode, 200, 'Response should not return err');
        assert.equal(body, 'Welcome to ' + app.id, 'Should return correct body text.');

        done();
      });

    });

  });

 test('Test search route', function(done) { 

    var params = {
      age: 2,
      gender: 'male',
      bark: 'loud'
    };

    var gold = [
      { id: 1, breed: 'boxer', gender: 'male', bark: 'loud', age: 2 },
      { id: 3, breed: 'chihuahua', gender: 'male', bark: 'loud', age: 2 }
    ];

    http.get('http://localhost:8081' + app.plugins.router.format('search', params), function(res) {
      var body = [];

      res.on('data', function(chunk) {
        body.push(chunk);
      });

      res.on('end', function() {
        body = JSON.parse(body.join(''));

        assert.equal(res.statusCode, 200, 'Response should not return err');
        assert.deepEqual(body, gold, 'Should return correct search result.');

        done();
      });

    });

  });


  test('Test single route', function(done) { 

    var params = {
      id: 3
    };

    var gold = { id: 3, breed: 'chihuahua', gender: 'male', bark: 'loud', age: 2 };

    http.get('http://localhost:8081' + app.plugins.router.format('single', params), function(res) {
      var body = [];

      res.on('data', function(chunk) {
        body.push(chunk);
      });

      res.on('end', function() {
        body = JSON.parse(body.join(''));

        assert.equal(res.statusCode, 200, 'Response should not return err');
        assert.deepEqual(body, gold, 'Should return correct search result.');

        done();
      });

    });

  });

});

