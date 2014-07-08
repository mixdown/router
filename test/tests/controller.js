var Controller = require('../../lib/controller.js');
var HttpContext = require('../../lib/http_context.js');
var Request = require('hammock').Request;
var Response = require('hammock').Response;
var assert = require('assert');

suite('Contoller', function() {

  test('parse()', function(done) {

    var controller = new Controller({
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
    });

    var httpContext = new HttpContext(
      new Request({
        url: '/api_v2/dogs/male/bark-loud/2'
      }),
      new Response()
    );

    assert.equal(controller.evaluate(httpContext.url.pathname), true, 'Should match route');
    controller.parse(httpContext);

    assert.ok(httpContext.params.gender, 'Should parse gender');
    assert.ok(httpContext.params.age, 'Should parse age');
    assert.ok(httpContext.params.bark, 'Should parse bark');

    done();
  });

  test('parse() with optional param', function(done) {

    var controller = new Controller({
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
    });

    var httpContext = new HttpContext(
      new Request({
        url: '/api_v2/dog/'
      }),
      new Response()
    );

    assert.equal(controller.evaluate(httpContext.url.pathname), true, 'Should match route');
    controller.parse(httpContext);

    assert.ok(httpContext.params.id == null, 'id should be empty');

    done();
  });
});