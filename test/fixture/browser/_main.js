// create new app with attached router.
var createApp = require('./js/app.js');
var assert = require('assert');

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

  test('Get Home', function(done) {
    app.router.navigate('home', {}, function(err, data) {
      assert.ifError(err, 'Should not return err');
      assert.equal(document.getElementById('output').innerHTML, 'home:{}', 'Should return correct body text.');
      done();
    });

  });

  test('Get Page with REST param', function(done) {
    app.router.navigate('dog_view', {
      id: 2
    }, function(err, data) {
      assert.ifError(err, 'Should not return err');
      assert.equal(document.getElementById('output').innerHTML, '   ', 'Should return correct body text.');
      done();
    });

  });
});