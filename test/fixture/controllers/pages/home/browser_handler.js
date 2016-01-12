module.exports = function(httpContext) {
  document.getElementById('output').innerHTML = httpContext.route + ':' + JSON.stringify(httpContext.params);
};