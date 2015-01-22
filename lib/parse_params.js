var _ = require('lodash');
var regexSplit = /(\?|\/)([^\?^\/]+)/g;

module.exports = function (s, params) {
  s = s || '';

  var restParams = s.match(regexSplit);
  var urlformat = [];

  // this is here so that we can detect when a literal router is being used so we can match a url with or without a trailing slash.
  var bHasParsableRestParams = false;

  if (!restParams || restParams.length === 0) {
    restParams = [s];
  }

  // replace named params with corresponding regexs and build paramMap.
  _.each(restParams, function (str, i) {
    var param = _.find(params, function (p, name) {
      return str.substring(1) === ':' + name;
    });

    if (param) {

      bHasParsableRestParams = true; // we found a parseable param

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

  // push optional trailing slash to the regex.
  if (!bHasParsableRestParams) {
    urlformat.push('\\/?');
  }

  return {
    urlformat: new RegExp('^' + urlformat.join('') + '$'),
    restParams: restParams
  };
};