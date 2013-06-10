var mixdown = require('mixdown-server'),
    serverConfig = new mixdown.Config(require( './server.json')),
    envConfig = null,
    packageJSON = require('../package.json');

serverConfig.config.server.version = packageJSON.version;

var main = mixdown.MainFactory.create({
    packageJSON: packageJSON,
    serverConfig: serverConfig
});

serverConfig.init();
logger.info('Server Version: ' + serverConfig.server.version);

module.exports = serverConfig;
