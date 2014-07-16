var dogList = require('../../../server/lib/dog_db.js');
var _ = require('lodash');

module.exports = {
  path: "/",
  description: "Home page.",
  params: {},
  get: function(httpContext) {
    var res = httpContext.response;
    var data = _.map(dogList.dogList, function(dog) {
      return dog.breed;
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.end(data.join());
  }
};