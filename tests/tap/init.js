var _ = require('lodash');
var test = require('tape').test;
var server = require('../fixture.js');

_.each(server.apps, function(app, appid) {
  
  test('Router plugin should attach', function(t) {
    t.ok(app.plugins.router, 'Router interface exists on plugins');
    t.end();
  });


  test('Create router instance', function(t) {
    console.log(require('util').inspect(app.plugins.router));
    var router = app.plugins.router.create();
    t.ok(router, 'Router instance exists'); 
    t.equal(typeof(router.dispatch), 'function', 'router.dispatch should be a function.');
    t.ok(router.params.length, 'Should contain some params');
    t.end();   
  })
});