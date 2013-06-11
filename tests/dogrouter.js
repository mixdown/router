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

  this.index = function() {
    var app = this.app;
    var req = this.req;
    var res = this.res;

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to ' + app.id + ' search');
  };

  this.dogs = function(restParams) {
    var req = this.req;
    var res = this.res;
    var results = searchDogs(restParams.age, restParams.gender, restParams.bark);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  };

};
util.inherits(DogRouter, Router);

DogRouter.prototype.dog = function(restParams) {
  var req = this.req;
  var res = this.res;
  var results = _.find(dogList, function(d) { return d.id == restParams.id; });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(results));
};

module.exports = DogRouter;