router
======

Router plugin for mixdown

Install
=======

```
npm install mixdown-router
```

Usage
=====

HTTP server side router for mixdown.  This plugin consumes declarative route table configuration and generates routes.

Mixdown configuration file.  There are 2 parts to declare.  

* Params is a hash of named parameters with regex matching.  There can only be one match group in the regex.  The matched value (the part in the parentheses) is the only part that will be passed to the handler.  See the bark param below.  

* Routes hash contains format strings for the routes.  These are the same as [pipeline-router](https://github.com/tommydudebreaux/pipeline-router "pipeline-router").


```javascript

"router": {
  "module": "/tests/dogrouter.js",
  "options": {
    "params": {
      "gender": "(\\w+)",
      "age": "(\\d+)",
      "id": "(\\d{1})",
      "bark": "bark-(loud|quiet)"
    },
    "routes": {
      "search": {
        "method": "GET",
        "path": "/dogs/:gender/:bark/:age",
        "handler": "dogs"
      },
      "single": {
        "method": "GET",
        "path": "/dog/:id",
        "query": [ "hidePictures" ],
        "handler": "dog"
      },
      "create": {
        "method": "POST",
        "path": "/create/dog/:id",
        "body": [ "gender", "age", "phone" ],
        "handler": "create"
      }
    }
  }
}

```

Next, you need to declare a router with handlers.  This is accomplished by inheriting from the base router.  Example of the dogrouter which is declared above.

```javascript

var _ = require('lodash');
var util = require('util');
var Router = require('mixdown-router');

// create a trivial list of dogs.
var dogList = [
  { id: 1, breed: 'boxer', gender: 'male', bark: 'loud', age: 2 },
  { id: 2, breed: 'boston terrier', gender: 'female', bark: 'quiet', age: 4 },
  { id: 3, breed: 'chihuahua', gender: 'male', bark: 'loud', age: 6 },
  { id: 4, breed: 'poodle', gender: 'female', bark: 'quiet', age: 5 }
];

// This function searches the list.  
var searchDogs = function(age, gender, bark) {
  return _.filter(dogList, function(d) {
    return (d.age == age || !age) &&
           (d.gender == gender || !gender) && 
           (d.bark == bark || !bark);
  });
};

// Create a new prototype and make it inherit from Router
var DogRouter = function() {
  Router.apply(this, arguments);

  // This examples attaches route handlers to the object instance.
  this.index = function() {
    var app = this.app;
    var req = this.req;
    var res = this.res;

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to ' + app.id + ' search');
  };

  // This examples attaches route handlers to the object instance.
  // In this case, the restful params are passed in a hash to the handler
  this.dogs = function(restParams) {
    var req = this.req;
    var res = this.res;
    var results = searchDogs(restParams.age, restParams.gender, restParams.bark);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  };

};
util.inherits(DogRouter, Router);

// You can also extend the prototype to attach the handler like this
DogRouter.prototype.dog = function(restParams) {
  var req = this.req;
  var res = this.res;
  var results = _.find(dogList, function(d) { return d.id == restParams.id; });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(results));
};

module.exports = DogRouter;

```

If you have a mixdown server running, then this should be all you need to get started.  See the units for more examples.


