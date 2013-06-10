var _ = require('lodash');
var tap = require('tap');
var test = tap.test;
var server = require('../fixture.js');
var MockRequest = require('hammock').Request;
var MockResponse = require('hammock').Response;

_.each(server.apps, function(app, appid) {
  
  test('Test route table', function(t) {

    t.ok(app.plugins.router, 'Router function should exist on app: ' + app.id);

      // var id = data.results[Math.round( Math.random() * 10)].id;
      // var req = new MockRequest({
      //   url: '/api/lead?ids=' + id + '&similar=false',
      //   headers: { host: app.config.hostmap[0] },
      //   cookies: {
      //     vast_user: encodeURIComponent(JSON.stringify(vast_user)),
      //     V_UID: encodeURIComponent('1234abcd'),
      //     V_AB: encodeURIComponent('test1=true')
      //   }
      // });
      // var res = new MockResponse();
      // var router = app.plugins.router();

      router.on('error', function(err) {});
      router.dispatch(req, res);

  });
});