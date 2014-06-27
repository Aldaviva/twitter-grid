var startTime   = new Date();

var fs          = require('fs');
var Q           = require('q');
fs.writeFile(".pid", process.pid);

var logger      = require('./common/logger')(module);
var userConfig  = require('../config');

var config      = require('./common/config').init(userConfig);

var db = require('./data/db');
var dbConnectionPromise = db.connect();

var server = require('./api/apiServer');
require('./api/tweetResource');
require('./api/staticServer');
var serverStartPromise = server.start();

/**
 * Shutdown handling
 */
var shutdownPromise;
var shutdown = module.exports.shutdown = function(){
	if(!shutdownPromise){
		shutdownPromise = startedPromise
			.finally(function(){
				logger.info("Shutting down...");
				return Q()
					.then(server.shutdown())
					.then(db.shutdown())
					.fail(function(err){
						logger.error(err);
						throw err;
					})
					.then(function(){
						logger.info("Shut down.");
						fs.unlinkSync(".pid");
						process.exit(0);
					})
					.done();
			});
	}
	return shutdownPromise;
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * Startup complete
 */
var startedPromise = module.exports.startedPromise = Q.all([ dbConnectionPromise, serverStartPromise ])
	.then(function(){
		logger.info("Startup complete in %d ms.", (new Date() - startTime));
	})
	.fail(function(err){
		logger.error("Failed to start: %s", err);
		shutdown();
		throw err;
	});
	
startedPromise.done();