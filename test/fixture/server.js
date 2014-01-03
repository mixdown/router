var broadway = require('broadway');
var Router = require('./router.js');
var http = require('http');

var app = {
  id: 'mixdown-router-unit-test',
  plugins: new broadway.App()
};

// attach the router instance, injecting the route table.
app.plugins.use(new Router(), {
  app: app,
  timeout: 3000,  // 3s timeout
  routes: require('./routes.json')
});

// export the start function which sets up the server and app.
// If you use Mixdown to initialize the server, then this is done for you in one of the "main" plugins.

module.exports.start = function(callback) {

  // setup an httpServer
  app.plugins.init(function(err) {

    // if failed, then kill the app b/c the routes are incorrectly configured.
    if (err) {
      console.error(err);
      process.exit();
    }

    // create the server and listen for requests.
    http.createServer(function (req, res) {

      app.plugins.router.create().dispatch(req, res);

    }).listen(8081, function(err) {
      callback(err, { app: app });
    });
    
  });
};

