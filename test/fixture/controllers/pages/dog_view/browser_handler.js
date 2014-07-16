var querystring = require('querystring');

module.exports = function(httpContext) {
  document.getElementById('output').innerHTML = httpContext.route + ':' + querystring.stringify(httpContext.params);
};