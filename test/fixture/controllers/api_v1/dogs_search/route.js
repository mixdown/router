var dogList = require('../../../server/lib/dog_db.js');

module.exports = {
  path: "/dogs/:age",
  description: "Search for dogs",
  timeout: 8000,
  params: {
    age: {
      regex: "(\\d+)",
      kind: "rest",
      enabled: true
    }
  },
  get: function(httpContext) {
    var res = httpContext.response;
    var data = dogList.search(httpContext.params.age, httpContext.params.gender, httpContext.params.bark);

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(data));
  },

  post: function(httpContext) {
    httpContext.response.end('Not Supported.');
  }
};