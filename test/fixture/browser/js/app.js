var Router = require('../router.js');
var App = require('mixdown-app').App;

module.exports = function() {
  var app = new App();

  app.use(new Router({
    routes: require('../../gold_manifest.js') // simulate the manifest coming from the server.
  }), 'router');

  // app.router.on('no-browser-handler', function(data) {
  //   console.log(data);
  // });

  app.router.on('invalid-route', function(data) {
    console.log(data, data.err.stack);
  });

  return app;
};