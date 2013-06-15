var _ = require('lodash');
var util = require('util');
var Router = require('../index.js');
var dogList = [
  { id: 1, breed: 'boxer', gender: 'male', bark: 'loud', age: 2 },
  { id: 2, breed: 'boston terrier', gender: 'female', bark: 'quiet', age: 4 },
  { id: 3, breed: 'chihuahua', gender: 'male', bark: 'loud', age: 6 },
  { id: 4, breed: 'poodle', gender: 'female', bark: 'quiet', age: 5 }
];

var searchDogs = function(age, gender, bark) {
  return _.filter(dogList, function(d) {
    return (d.age == age || !age) &&
           (d.gender == gender || !gender) && 
           (d.bark == bark || !bark);
  });
};

var DogRouter = function() {
  Router.apply(this, arguments);

  this.index = function(httpContext) {
    var res = httpContext.response;

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to ' + httpContext.app.id + ' search');
  };

  this.dogs = function(httpContext) {
    var res = httpContext.response;
    var results = searchDogs(httpContext.params.age, httpContext.params.gender, httpContext.params.bark);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  };

};
util.inherits(DogRouter, Router);

DogRouter.prototype.dog = function(httpContext) {
  var res = httpContext.response;
  var results = _.find(dogList, function(d) { return d.id == httpContext.params.id; });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(results));
};

module.exports = DogRouter;