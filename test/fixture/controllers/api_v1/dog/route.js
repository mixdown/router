var dogList = require('../../../server/lib/dog_db.js');

module.exports = {
  path: "/dog/?:id",
  description: "CRUD for a dog record.",
  params: {
    id: {
      regex: "(\\d{1})",
      kind: "rest",
      enabled: true
    }
  },
  get: function(httpContext) {
    var res = httpContext.response;
    var data = dogList.get(httpContext.params.id);

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(data));
  },

  post: function(httpContext) {
    httpContext.response.end('Not Supported.');
  },

  put: function(httpContext) {
    httpContext.response.end('Not Supported.');
  },

  delete: function(httpContext) {
    httpContext.response.end('Not Supported.');
  }
};