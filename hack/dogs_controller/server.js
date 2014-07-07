module.exports = {
  get: function(httpContext) {
    var app = httpContext.app;

    app.plugins.dogs.search(httpContext.params.search_term).then(function(data) {
      app.plugins.json(data, httpContext);
    });
  },
  post: function(httpContext) {

  },
  put: function(httpContext) {

  },
  delete: function(httpContext) {

  }
}