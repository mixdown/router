var dogList = require('../../../lib/dog_db.js');


module.exports = {
  path: "/",
  description: "Home page.",
  params: {},
  get: function(httpContext) {
    var res = httpContext.response;
    var data = _.map(dogList.dogList, function(dog) {
      return [dog.id, dog.breed].join(' ');
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.end(JSON.stringify(data));
  }
};