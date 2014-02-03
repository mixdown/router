var MixdownRouter = require('../../index.js');
var broadway = require('broadway');
var util = require('util');
var _ = require('lodash');

// fake data, imagine that you would probably wire this to some data storage
var dogList = [
  { id: 1, breed: 'boxer', gender: 'male', bark: 'loud', age: 2 },
  { id: 2, breed: 'boston terrier', gender: 'female', bark: 'quiet', age: 4 },
  { id: 3, breed: 'chihuahua', gender: 'male', bark: 'loud', age: 2 },
  { id: 4, breed: 'poodle', gender: 'female', bark: 'quiet', age: 5 }
];

var searchDogs = function(age, gender, bark) {
  return _.filter(dogList, function(d) {
    return (d.age == age || !age) &&
           (d.gender == gender || !gender) && 
           (d.bark == bark || !bark);
  });
};


// Create a new prototype and make it inherit from Router
var DogRouter = function() {
  MixdownRouter.apply(this, arguments);

  // This examples attaches route handlers to the object instance.
  this.index = function(httpContext) {

    httpContext.response.writeHead(200, { 'Content-Type': 'text/plain' });
    httpContext.response.end('Welcome to ' + httpContext.app.id);
  };

  // This examples attaches route handlers to the object instance.
  // In this case, the restful params are passed in a hash to the handler
  this.dogs = function(httpContext) {
    var data = searchDogs(httpContext.params.age, httpContext.params.gender, httpContext.params.bark);

    httpContext.response.writeHead(200, { 'Content-Type': 'application/json' });
    httpContext.response.end(JSON.stringify(data));
  };

};

util.inherits(DogRouter, MixdownRouter);

// You can also extend the prototype to attach the handler like this
DogRouter.prototype.dog = function(httpContext) {
  var data = null;

  for(var i = 0; i < dogList.length; i++) {
    if (dogList[i].id == httpContext.params.id) {
      data = dogList[i];
    }
  }

  httpContext.response.writeHead(200, { 'Content-Type': 'application/json' });
  httpContext.response.end(JSON.stringify(data));
};

module.exports = DogRouter;