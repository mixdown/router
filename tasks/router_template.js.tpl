var MixdownRouter = require('mixdown-router');
var manifest = require('./manifest.js');

module.exports = MixdownRouter.extend({
  init: function(options) {
    options = options || {};
    options.routes = manifest;

    for(var k in options.routes) {
      if (options.routes[k].browser && typeof(this[k]) !== 'function') {
        throw new Error('Route missing handler - ' + k);
      } else {
        options.routes[k].browser_handler = this[k];
      }
    }

    this._super(options);
  },
	/** HANDLERS HERE **/
});
