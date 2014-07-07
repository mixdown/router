![travis-ci status](https://travis-ci.org/mixdown/router.png)

[![browser support](https://ci.testling.com/mixdown/router.png)](https://ci.testling.com/mixdown/router)

## mixdown-router

Bi-directional router for node.js and browsers.  This module provides consistent pattern for declaring routes in a web application as well as interpreting http(s) requests and passing controller to a controller action.

**Features**

* Bi-directional routers can both interpret and generate urls. 
* Configuration based routes implemented with a route table or manifest. 
* Compatible with node.js on the server
* Compatible with modern browsers and push state.
* IN PROCESS: Implement options for older browsers like IE8.


## Install

```
npm install mixdown-router
```

## Usage

This plugin is consumes a list of file system paths.  Using the list of paths, it loads controllers found at the path.  If the path is a folder, then if searches the contents on the folder to find compatible controllers.



## Controller Specification

A controller can end with any suffix and this is configurable.  It is recommended that the controllers end with the suffix ```controller```.  In the example file structure below, the dogs, cats, and lollipops controllers would be loaded, but the ```helpers.js``` file would not be loaded as a controller.

```
/controllers
 - dogs.controller
 - cats.controller
 - lollipops.controller
 - helpers.js
```

### Controller exports

* **path**: {String} [required] path spec for the uri.  This includes any named REST params.  Query params are not specified here as they are typically used to denote optional values.
* **timeout**: {Number} [optional] Number of milliseconds to wait for the controller to respond to the request before sending back a fail error code.
* **description**: {String} [optional] Human readable definition of what the route does.
* **authenticate**: {Boolean} [optional] if true, then the _authenticate() method will be executed for this controller before calling handler.  default: true


* **get**: {Function} [optional] Called with this route is matched on a GET method
* **post**: {Function} [optional] Called with this route is matched on a POST method
* **put**: {Function} [optional] Called with this route is matched on a PUT method
* **delete**: {Function} [optional] Called with this route is matched on a DELETE method

* **params**: {Array} [optional] list of params that are valid for this route.  In addition to existence, they are validated during route intepretation and url generation to be valid using the regex.  

There are 2 types of params - query and rest.  

  **Rest params** are added to a path using the following operators ``` :param_name ``` meaning it is required or ``` ?:param_name ``` meaning that it is optional (to support similar paths like this ```/search```, ```/search/```, and ```/search/fido```).

  **Query params** are optional on the url (as is typical with querystring params).

### Example of a controller

```javscript

module.exports.path = '/dogs/search/:search_term';
module.exports.description = "Performs search for dogs."
module.exports.timeout = 10000;  // 10 secs
module.exports.params = {
  "search_term": {
    "kind": "rest",
    "regex": "(.*)",
    "default": "",
    "enabled": true
  },
  "pagenum": {
    "kind": "query",
    "regex": "(\\d+)",
    "default": "0",
    "enabled": true
  },
  "pagesize": {
    "kind": "query",
    "regex": "(\\d+)",
    "default": "5",
    "enabled": true
  }
};

module.exports.get = function(httpContext) {
  var app = httpContext.app;

  app.plugins.dogs.search(httpContext.params.search_term).then(function(data) {
    app.plugins.json(data, httpContext);
  });
};

module.exports.post = function(httpContext) {

};

module.exports.put = function(httpContext) {

};

module.exports.delete = function(httpContext) {

};

```

[Unit tests startup a simple node server](https://github.com/mixdown/router/blob/master/test/fixture/server.js).  This could be injected to any framework like mixdown or express.

## Plugin Configuration

* **controllers**: [required] This block contains information to generate routes, controllers, and handlers.
* **controllers.file_extension**: {String} [optional] File extension to be used when searching for controllers.  default: ```.controller```
* **controllers.paths**: {Array} [required] List of file system paths to serach for controllers.  This is used to generate a manifest in the form of the Manifest Specification below.

* **timeout**: [optional] Global router setting.  Number of milliseconds to wait before sending a 500 and timeout to the client.  This will avoid hanging sockets if your controller never writes the response (usually this is in error).  Default is set in the [pipeline-router dependency here](https://github.com/tommydudebreaux/pipeline-router/blob/master/index.js#L33).  Currently ```120000``` or 2 minutes, same as node.js socket timeout.

## Manifest Specification

The route table is a hash of named routes that look a lot like the [node.js url object](http://nodejs.org/api/url.html), but with more properties for specifying parameters.  They are generated from the controller object.

* **method**: [optional] The http verb to interpret.  same as the node.js url object.  default ```GET```
* **protocol**: [optional] Same as the node.js url object.  ex: http, https.  This is handy for specifying urls to resources from a different domain than your node server.  (ex: CDN resource)
* **name**: [required] the name of the route.  MUST MATCH THE KEY.  (backlog: remove this and have mixdown-router handle implicitly)
* **path**: [required] the RESTful part of the url.  To specify a parameter, then use ```:name_of_param```
* **description**: [optional] Plain text hint for people to read about the route.
* **enabled**: [optional] if true, then the route will be evaluated by the router.  If false, then this route can only be used for url generation. Default: ```false```
* **timeout**: Number of milliseconds to wait before sending a 500 and timeout to the client.  This overrides the global setting which is described above.
* **browser**: If true, then this is a browser only route.  It will not be interpreted by the server.

* **handler**: [required] The name of the controller function which will process this route. (backlog: if null, then try the route name method).  


&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;NOTE: if there is no handler function defined on the router instance, then the plugin's initialization will fail hard (and mixdown will not start).  This is on purpose to encourage folks to be pedantic and define only what is necessary.

* **params**: Hash of parameters that are validated and interpreted by the router.
* **params[param_name].kind**: [required] Tells the router where to find the parameter on the url. Valid values are ```rest``` and ```query```.  (backlog: consider supporting cookie or header parsing/validation)
* **params[param_name].description**: [optional] Plain language describing the param to humans. 
* **params[param_name].regex**: [required] Regular Expression used to validate the input. (backlog: make optional and accept anything except url separator) 
* **params[param_name].default**: [optional] If the parameter is not defined, then this value is used.  This is only active for ```query``` parameters as using for REST params would cause the full url validation.
* **params[param_name].enabled**: This means that users of the route area allowed to send a value.  If false, then the param is set as a constant value.  Useful if you have a querystring that needs to be dependency injected to a controller, but your users are not allows to touch it. (ex: configuring an apikey)



Url Generation
==============

Since the route table should be the single source for all things routing, then it makes sense that it should be able to generate as well as interpret.  (e.g. bi-directional)

To generate a route, here is an example which is disconnected from mixdown config.

```javascript
var Router = require('mixdown-router');
var app = {
  plugins: new (require('broadway')).App()
};

app.plugins.use(new Router() { 
  app: app, 
  routes: {
    "search": {
      "method": "GET",
      "path": "/dogs/:gender/:bark/:age",
      "handler": "dogs",
      "params": {
        "bark": {
          "regex": "bark-(loud|quiet)",
          "kind": "rest",
          "enabled": true
        },
        "gender": {
          "regex": "(\\w+)",
          "kind": "rest",
          "enabled": true
        },
        "age": {
          "regex": "(\\d+)",
          "kind": "rest",
          "enabled": true
        }
      }
    },

    "single": {
      "method": "GET",
      "path": "/dog/:id",
      "handler": "dog",
      "params": {
        "hidePictures": {
          "kind": "query",
          "regex": "(true|false)",
          "enabled": true
        },
        "id": {
          "regex": "(\\d{1})",
          "kind": "rest",
          "enabled": true
        }
      }
    },

    "home": {
      "method": "GET",
      "path": "/",
      "handler": "index",
      "params": {}
    }
  }
});

// Get the url as a node url object
var uri = app.plugins.router.url('search', {
  age: 6,
  gender: 'female',
  bark: 'quiet'
});

console.log(JSON.stringify(uri)); // ==>
// {
//   "protocol": null,
//   "slashes": null,
//   "auth": null,
//   "host": null,
//   "hash": null,
//   "search": null,
//   "query": null,
//   "pathname": "/dogs/female/bark-loud/6",
//   "path": null,
//   "href": ""
// }

// Get the url as a string url
var href = app.plugins.router.format('search', {
  age: 6,
  gender: 'female',
  bark: 'quiet'
});

console.log(href);  // ==> /dogs/female/bark-quiet/6


// Get the url as a node url object with querystring
var uriSingle = app.plugins.router.url('single', {
  id: 1234,
  hidePictures: true
});

console.log(JSON.stringify(uriSingle)); // ==>
// {
//   "protocol": null,
//   "slashes": null,
//   "auth": null,
//   "host": null,
//   "hash": null,
//   "search": null,
//   "query": { hidePictures: true },
//   "pathname": "/dog/1234",
//   "path": null,
//   "href": ""
// }

// Get url with querystring params
var hrefWithQuery = app.plugins.router.format('single', {
  id: 1234,
  hidePictures: true
});
  
console.log(hrefWithQuery);  // ==> /dog/1234?hidePictures=true
```



