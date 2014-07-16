module.exports = {
  "api_v1/dog": {
    "browser": false,
    "delete": true,
    "description": "CRUD for a dog record.",
    "get": true,
    "name": "api_v1/dog",
    "params": {
      "id": {
        "enabled": true,
        "kind": "rest",
        "name": "id",
        "regex": "(\\d{1})"
      }
    },
    "path": "/api/v1/dog/?:id",
    "post": true,
    "put": true,
    "timeout": 3000
  },
  "api_v1/dogs_search": {
    "browser": false,
    "delete": false,
    "description": "Search for dogs",
    "get": true,
    "name": "api_v1/dogs_search",
    "params": {
      "age": {
        "enabled": true,
        "kind": "rest",
        "name": "age",
        "regex": "(\\d+)"
      }
    },
    "path": "/api/v1/dogs/:age",
    "post": true,
    "put": false,
    "timeout": 8000
  },
  "api_v2/dog": {
    "browser": false,
    "delete": true,
    "description": "CRUD for a dog record.",
    "get": true,
    "name": "api_v2/dog",
    "params": {
      "hidePictures": {
        "enabled": true,
        "kind": "query",
        "name": "hidePictures",
        "regex": "_PxEgEr_/(true|false)/"
      },
      "id": {
        "enabled": true,
        "kind": "rest",
        "name": "id",
        "regex": "(\\d{1})"
      }
    },
    "path": "/api_v2/dog/?:id",
    "post": true,
    "put": true,
    "timeout": 3000
  },
  "api_v2/dogs_search": {
    "browser": false,
    "delete": false,
    "description": "Search for dogs",
    "get": true,
    "name": "api_v2/dogs_search",
    "params": {
      "age": {
        "enabled": true,
        "kind": "rest",
        "name": "age",
        "regex": "(\\d+)"
      },
      "bark": {
        "enabled": true,
        "kind": "rest",
        "name": "bark",
        "regex": "bark-(loud|quiet)"
      },
      "gender": {
        "enabled": true,
        "kind": "rest",
        "name": "gender",
        "regex": "(\\w+)"
      }
    },
    "path": "/api_v2/dogs/:gender/:bark/:age",
    "post": true,
    "put": false,
    "timeout": 6000
  },
  "dog_view": {
    "browser": true,
    "browser_handler": "function (httpContext) {\n  document.getElementById('output').innerHTML = httpContext.route + ':' + querystring.stringify(httpContext.params);\n}",
    "delete": false,
    "description": "Shows a dog page.",
    "get": true,
    "name": "dog_view",
    "params": {
      "id": {
        "enabled": true,
        "kind": "rest",
        "name": "id",
        "regex": "(\\d{1})"
      }
    },
    "path": "/dogs/:id",
    "post": false,
    "put": false,
    "timeout": 3000
  },
  "home": {
    "browser": true,
    "browser_handler": "function (httpContext) {\n  document.getElementById('output').innerHTML = httpContext.route + ':' + JSON.stringify(httpContext.params);\n}",
    "delete": false,
    "description": "Home page.",
    "get": true,
    "name": "home",
    "params": {},
    "path": "/",
    "post": false,
    "put": false,
    "timeout": 3000
  }
};