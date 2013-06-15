var _ = require('lodash');
var util = require('util');
var Router = require('../index.js');
var catList = [
  { id: 1, breed: 'persian', gender: 'male', claws: 'yes', age: 2 },
  { id: 2, breed: 'siamese', gender: 'female', claws: 'yes', age: 4 },
  { id: 3, breed: 'american shorthair', gender: 'male', claws: 'no', age: 6 }
];

var searchCats = function(age, gender, bark) {
  return _.filter(catList, function(d) {
    return (d.age == age || !age) &&
           (d.gender == gender || !gender) && 
           (d.bark == bark || !bark);
  });
};

var CatRouter = function() {
  Router.apply(this, arguments);

  this.index = function(httpContext) {
    var res = httpContext.response;

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to ' + httpContext.app.id + ' search');
  };

  this.cats = function(httpContext) {
    var res = httpContext.response;
    var results = searchCats(httpContext.params.age, httpContext.params.gender, httpContext.params.bark);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  };

};
util.inherits(CatRouter, Router);

CatRouter.prototype.cat = function(httpContext) {
  var res = httpContext.response;
  var results = _.find(catList, function(d) { return d.id == httpContext.params.id; });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(results));
};

module.exports = CatRouter;