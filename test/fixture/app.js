var Router = require('../../index.js');
var broadway = require('broadway');

module.exports = function() {
  var app = {
    plugins: new broadway.App()
  };

  app.plugins.use(new Router(), {
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
  });

  // app.plugins.router.on('no-browser-handler', function(data) {
  //   console.log(data);
  // });

  app.plugins.router.on('invalid-route', function(data) {
    console.log(data, data.err.stack);
  });

  return app;
};