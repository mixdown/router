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


  test('Router plugin should attach', function(done) {
    assert.ok(app.plugins.router, 'Router interface exists on plugins');
    done();
  });

  test('Create router instance', function(done) {

    // console.log(require('util').inspect(app.plugins.router));
    var router = app.plugins.router.create();
    assert.ok(router, 'Router instance exists'); 
    assert.equal(typeof(router.dispatch), 'function', 'router.dispatch should be a function.');

    done();   
  });

});




suite('Initialization validation', function() {

  var app = {
    plugins: new broadway.App()
  };

  setup(function(done) {

    app.plugins.use(new Router(), {
      timeout: 3000,  // 3s timeout
      routes: _.extend(_.cloneDeep(routes), {
        badRoute: {
          method: 'GET',
          path: '/asd/sad/sfdsg',
          handler: 'kjashdfkjhsf'
        }
      })
    });

    done();

  });

  test('Invalid route handler should cause init error', function(done){

    app.plugins.init(function(err) {
      assert.ok(err, 'Should cause init error');
      done();
    });

  });

});







