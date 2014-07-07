var dogList = require('../../../lib/dog_db.js');
var _ = require('lodash');

module.exports = {
  path: "/dogs/:id",
  description: "Shows a dog page.",
  params: {
    id: {
      regex: "(\\d{1})",
      kind: "rest",
      enabled: true
    }
  },
  get: function(httpContext) {
    var res = httpContext.response;
    var dog = dogList.get(httpContext.params.id);

    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });

    res.write(dog.id + '\n');
    res.write(dog.breed + '\n');
    res.write(dog.age + '\n');
    res.write(dog.bark + '\n');

    res.end();
  }
};