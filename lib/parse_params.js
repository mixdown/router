var _ = require('lodash');
var regexSplit = /(\?|\/)([^\?^\/]+)/g;

module.exports = function(s, params) {
  s = s || '';

  var restParams = s.match(regexSplit);
  var urlformat = [];

  if (!restParams || restParams.length === 0) {
    restParams = [s];
  }

  // replace named params with corresponding regexs and build paramMap.
  _.each(restParams, function(str, i) {
    var param = _.find(params, function(p) {
      return str.substring(1) === ':' + p.name;
    });

    if (param) {
      var rstr = param.regex.toString();
      urlformat.push('\\/' + (str[0] === '?' ? '?' : '')); // push separator (double backslash escapes the ? or /)
      urlformat.push(rstr.substring(1, rstr.length - 1)); // push regex
    } else {
      urlformat.push(str);
    }
  });

  return new RegExp('^' + urlformat.join('') + '$');
};