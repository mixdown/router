var dogList = require('../../../server/lib/dog_db.js');

module.exports = {
  path: "/dogs/:gender/:bark/:age",
  description: "Search for dogs",
  timeout: 6000,
  params: {
    bark: {
      regex: "bark-(loud|quiet)",
      kind: "rest",
      enabled: true
    },
    gender: {
      regex: "(\\w+)",
      kind: "rest",
      enabled: true
    },
    age: {
      regex: "(\\d+)",
      kind: "rest",
      enabled: true
    },
    "hidePictures": {
      "enabled": true,
      "kind": "query",
      "name": "hidePictures",
      "regex": "(true|false)"
    },
    "limit": {
      "enabled": true,
      "kind": "query",
      "name": "limit",
      "regex": "(\\d+)"
    }
  },
  get: function (httpContext) {
    var res = httpContext.response;
    var data = dogList.search(httpContext.params.age, httpContext.params.gender, httpContext.params.bark);

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(data));
  },

  post: function (httpContext) {
    httpContext.response.end('Not Supported.');
  }
};