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

test('invalid route should cause init error', function(t){

  var Router = require('../../index.js')
  var app = {};
  var routerPlug = new Router('router');
  var routeName1 = 'asdfasdfasdf' //make it a weird name to test the message
  var routeName2 = 'alsobad';
  var goodRouteName = 'good'
  var options = {
    'routes':{
      routeName1:{
        'name':routeName1,
        'path':'/',
        'method':'GET',
        'handler':'nonexistant'
      },
      routeName2:{
        'name':routeName2,
        'path':'/',
        'method':'GET',
        'handler':'nonexistant'
      },
      goodRouteName:{
        'name':goodRouteName,
        'path':'/',
        'method':'GET',
        'handler':'goodhandler'
      }
    }
  };

  routerPlug.goodhandler = function(h) {

  }

  routerPlug.attach.call(app,options);
  
  
  routerPlug.init.call(app,function(err){
    t.ok(err,'an error should be returned');
    t.notEquals(err.message.indexOf(routeName1),-1,'the error should contain the name of the first bad route');
    t.notEquals(err.message.indexOf(routeName2),-1,'the error should contain the name of the second bad route');
    t.equals(err.message.indexOf(goodRouteName),-1,'the error should not contain the name of the good route');
    t.end();
  });
});