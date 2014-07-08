module.exports = {
  "api_v1/dog": {
    "browser": false,
    "delete": true,
    "description": "CRUD for a dog record.",
    "get": true,
    "params": {
      "id": {
        "enabled": true,
        "kind": "rest",
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
    "params": {
      "age": {
        "enabled": true,
        "kind": "rest",
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
    "params": {
      "hidePictures": {
        "enabled": true,
        "kind": "query",
        "regex": "(true|false)"
      },
      "id": {
        "enabled": true,
        "kind": "rest",
        "regex": "(\\d{1})"
      }
    },
    "path": "api_v2/dog/?:id",
    "post": true,
    "put": true,
    "timeout": 3000
  },
  "api_v2/dogs_search": {
    "browser": false,
    "delete": false,
    "description": "Search for dogs",
    "get": true,
    "params": {
      "age": {
        "enabled": true,
        "kind": "rest",
        "regex": "(\\d+)"
      },
      "bark": {
        "enabled": true,
        "kind": "rest",
        "regex": "bark-(loud|quiet)"
      },
      "gender": {
        "enabled": true,
        "kind": "rest",
        "regex": "(\\w+)"
      }
    },
    "path": "api_v2/dogs/:gender/:bark/:age",
    "post": true,
    "put": false,
    "timeout": 6000
  },
  "dog_view": {
    "browser": true,
    "delete": false,
    "description": "Shows a dog page.",
    "get": true,
    "params": {
      "id": {
        "enabled": true,
        "kind": "rest",
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
    "delete": false,
    "description": "Home page.",
    "get": true,
    "params": {},
    "path": "/",
    "post": false,
    "put": false,
    "timeout": 3000
  }
};