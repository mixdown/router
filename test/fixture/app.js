var Router = require('../../index.js');
var App = require('mixdown-app').App;

module.exports = function() {
  var app = new App();

  app.use(new Router({
    timeout: 3000, // 3s timeout
    paths: [{
      path: './test/fixture/controllers/api_v1',
      url_prefix: '/api/v1'
    }, {
      path: './test/fixture/controllers/api_v2'
    }, {
      path: './test/fixture/controllers/pages',
      url_prefix: '',
      add_namespace: false
    }]
  }), 'router');

  // app.router.on('no-browser-handler', function(data) {
  //   console.log(data);
  // });

  app.router.on('invalid-route', function(data) {
    console.log(data, data.err.stack);
  });

  return app;
};