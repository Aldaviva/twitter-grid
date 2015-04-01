var _               = require('lodash');
var config          = require('../common/config');
var ent             = require('ent');
var logger          = require('../common/logger')(module);
var Q               = require('q');
var tweetRepository = require('../data/tweetRepository');
var Twitter         = require('twitter');

module.exports = {
	fetchAndStoreMoreTweets: fetchAndStoreMoreTweets
};

var QUERY = "great video conference using @bluejeansnet";

var twitter = new Twitter({
	consumer_key: config.twitter.consumerKey,
	consumer_secret: config.twitter.consumerSecret,
	access_token_key: config.twitter.accessTokenKey,
	access_token_secret: config.twitter.accessTokenSecret
});

function fetchAndStoreMoreTweets(){
	logger.info("Fetching tweets...");
	return searchForTweets()
		.then(function(rawTweets){
			logger.debug("downloaded %d potential tweets", rawTweets.length);
			return _(rawTweets)
				.map(convertSearchResultToTweet)
				.reject(isBlacklistedScreenName)
				.reject(isBlacklistedIcon)
				.filter(doesTweetContainQuery)
				.unique('screenName')
				.value();
		})
		.then(function(tweets){
			return [tweets, removePreviousTweetsFromUsers(_.pluck(tweets, "screenName"))];
		})
		.spread(function(tweets){
			return tweetRepository.save(tweets);
		})
		.then(function(saveResult){
			logger.info("Saved %d tweets to the database.", saveResult.length);
		})
		.fail(function(err){
			if(err.code === "ENOSTATUS"){
				//empty search results, continue normally
			} else {
				throw err;
			}
		})
		.done();
}

function searchForTweets(){
	return tweetRepository.getLatestId()
		.then(function(latestTweetId){
			var deferred = Q.defer();
			var searchParams = {
				count: 100,
				result_type: "recent"
			};
			if(latestTweetId){
				searchParams.since_id = latestTweetId;
			}
			twitter.search(QUERY, searchParams, deferred.resolve);
			return deferred.promise;
		})
		.then(function(searchResult){
			if(searchResult.statuses){
				return searchResult.statuses;
			} else {
				var err = new Error("No statuses found in search.");
				err.code = "ENOSTATUS";
				throw err;
			}
		});
}

function isBlacklistedScreenName(tweet){
	var blacklistedScreenNames = ["bluejeansnet", "teddfox", "morganrash", "aspenlee", "edischner", "cheeon", "brittanyelucero"];
	return _.contains(blacklistedScreenNames, tweet.screenName.toLowerCase());
}

function isBlacklistedIcon(tweet){
	return tweet.profileImageUrl.indexOf("default_profile") !== -1;
}

function doesTweetContainQuery(tweet){
	// Sometimes people insert extra words, so only check for a substring of the query we care about.
	// real example: "I just had a great video conference with a (Medanta Doctor) using @BlueJeansNet - technologically, a great move!!"
	return tweet.body.toLowerCase().indexOf("great video conference") !== -1;
}

function convertSearchResultToTweet(searchResult){
	return {
		_id             : searchResult.id_str,
		name            : searchResult.user.name,
		screenName      : searchResult.user.screen_name,
		body            : ent.decode(searchResult.text),
		date            : new Date(searchResult.created_at).getTime(),
		profileImageUrl : searchResult.user.profile_image_url.replace("_normal", "_200x200")
	};
}

function removePreviousTweetsFromUsers(screenNames){
	return Q.all(_.map(screenNames, tweetRepository.removeTweetsByScreenName));
}
