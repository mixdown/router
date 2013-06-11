var _ = require('lodash');
var util = require('util');
var Router = require('../index.js');
var dogList = [
  { id: 1, breed: 'persian', gender: 'male', claws: 'yes', age: 2 },
  { id: 2, breed: 'siamese', gender: 'female', claws: 'yes', age: 4 },
  { id: 3, breed: 'american shorthair', gender: 'male', claws: 'no', age: 6 }
];

var searchCats = function(age, gender, bark) {
  return _.filter(dogList, function(d) {
    return (d.age == age || !age) &&
           (d.gender == gender || !gender) && 
           (d.bark == bark || !bark);
  });
};

var CatRouter = function() {
  Router.apply(this, arguments);

  this.index = function() {
    var app = this.app;
    var req = this.req;
    var res = this.res;

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to ' + app.id + ' search');
  };

  this.cats = function(restParams) {
    var req = this.req;
    var res = this.res;
    var results = searchCats(restParams.age, restParams.gender, restParams.bark);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  };

};
util.inherits(CatRouter, Router);

CatRouter.prototype.cat = function(restParams) {
  var req = this.req;
  var res = this.res;
  var results = _.find(dogList, function(d) { return d.id == restParams.id; });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(results));
};

module.exports = CatRouter;