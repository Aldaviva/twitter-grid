var _               = require('lodash');
var config          = require('../common/config');
var logger          = require('../common/logger')(module);
var Q               = require('q');
var tweetRepository = require('../data/tweetRepository');

module.exports = {
	fetchAndStoreMoreTweets: fetchAndStoreMoreTweets
};

function fetchAndStoreMoreTweets(){
	//download a bunch of tweets from the search api

	//blacklist by screen_name
	//blacklist by icon path basename matching /default_profile_.*/
	//convert to tweet business entity
	//remove person's previous tweets from repo, if any
	//add to repo
}