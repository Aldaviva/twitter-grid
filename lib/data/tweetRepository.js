var db     = require('../data/db');
var Q      = require('q');
var logger = require('../common/logger')(module);
var _      = require('lodash');

var DEFAULT_SORT = [["date", -1]];

var tweetCollection = db.collection('tweets');
tweetCollection.ensureIndex({ screen_name: 1 }, { w: 0 });
tweetCollection.ensureIndex({ date: 1 }, { w: 0 });

module.exports = {
	listTweets: listTweets,
	removeTweetsByScreenName: removeTweetsByScreenName
};

/**
 * @param opts
 *  - sort: order of results, by default [['date', -1]]
 *  - limit: return at most this many results, by default 144
 *  any other options will be used as search criteria
 */
function listTweets(opts){
	var sort = opts.sort || DEFAULT_SORT;
	var limit = opts.limit || 144;

	var criteria = {};
	if(opts.minId){
		criteria._id = { $gt: opts.minId };
	}

	return Q.ninvoke(tweetCollection, "find", criteria, { limit: limit, sort: sort })
		.then(function(cursor){
			return Q.ninvoke(cursor, "toArray");
		});
}

function removeTweetsByScreenName(screenName){
	return Q.ninvoke(tweetCollection, "remove", { screen_name: screenName });
}

/**
 * @param tweets Object or Array
 */
function save(tweets){
	return Q.ninvoke(tweetCollection, "insert", tweets);
}

function getLatestId(){
	return Q.ninvoke(tweetCollection, "findOne", { _id: 1 }, { sort: [["_id", -1]] } )
		.get("_id");
}