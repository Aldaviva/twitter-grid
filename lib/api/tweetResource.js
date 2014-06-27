var _               = require('lodash');
var apiServer       = require('./apiServer');
var logger          = require('../common/logger')(module);
var tweetRepository = require('../data/tweetRepository');

apiServer.post({ path: '/cgi-bin/tweets/', name: 'listTweets' }, function(req, res, next){
	var opts = _.pick(req.query, "minId", "limit");

	tweetRepository.listTweets(opts)
		.then(function(tweets){
			res.send(tweets);
		})
		.fail(next);
});