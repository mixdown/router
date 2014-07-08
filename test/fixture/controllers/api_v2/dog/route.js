var dogList = require('../../../lib/dog_db.js');

module.exports = {
  path: "/dog/?:id",
  description: "CRUD for a dog record.",
  params: {
    hidePictures: {
      kind: "query",
      regex: "(true|false)",
      enabled: true
    },
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
    var res = httpContext.response;
    var data = {
      ok: true,
      id: httpContext.body.id
    };

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(data));
  },

  put: function(httpContext) {
    var res = httpContext.response;
    var data = {
      ok: true,
      id: httpContext.body.id
    };

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(data));
  },

  delete: function(httpContext) {
    var res = httpContext.response;
    var data = {
      ok: true,
      id: httpContext.params.id
    };

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(data));
  }

};