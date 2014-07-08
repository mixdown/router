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
    var param = _.find(params, function(p, name) {
      return str.substring(1) === ':' + name;
    });

    if (param) {
      var rstr = param.regex.toString();
      var optChar = (str[0] === '?' ? '?' : '');
      urlformat.push('\\/' + optChar); // push separator (double backslash escapes the ? or /)
      urlformat.push(rstr + optChar); // push regex
      restParams[i] = _.clone(param);
      restParams[i].regex = new RegExp(rstr);
    } else {
      urlformat.push(str);
      restParams[i] = null; // this is not a matched param. key is there for placeholder.
    }
  });

  return {
    urlformat: new RegExp('^' + urlformat.join('') + '$'),
    restParams: restParams
  };
};