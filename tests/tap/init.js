var _ = require('lodash');
var test = require('tape').test;
var server = require('../fixture.js');

_.each(server.apps, function(app, appid) {
  
  test('Router plugin should attach', function(t) {
    t.ok(app.plugins.router, 'Router interface exists on plugins');
    t.end();
  });


  test('Create router instance', function(t) {
    var router = app.plugins.router.create();
    t.ok(router, 'Router instance exists'); 
    t.equal(typeof(router.dispatch), 'function', 'router.dispatch should be a function.');
    t.equal(router.params.length, 4, 'Should contain 4 params');
    t.end();   
  })
});