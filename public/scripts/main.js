var API_ROOT = "/cgi-bin/";
var ICON_PLACEHOLDER_MASK = [
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1]
];
var ICON_SIZE = 120;

var tweets = [];
var containerEl = $('.container');
var coordinates = getCoordinatesFromPlaceholderMask();

main();


function main(){
	setInterval(update, 15*60*1000);
	update();
}

function update(){
	return $.getJSON(API_ROOT+'tweets?limit='+getIconLimit())
		.done(function(_tweets){
			tweets = _tweets;
			render();
		});
}

function render(){
	var iconsEl = $('.icons', containerEl);
	iconsEl.empty();

	var coords = getRandomCoordinates();
	var fragment = $(document.createDocumentFragment());
	_.forEach(tweets, function(tweet, tweetIdx){
		var linkEl = $('<a>')
			.attr({
				href: 'https://twitter.com/'+tweet.screenName,
				target: '_blank'
			});
		var iconEl = $('<img>')
			.addClass('icon')
			.attr({
				src: tweet.profileImageUrl,
				title: tweet.name+" (@"+tweet.screenName+"):\n"+tweet.body
			})
			.css({
				top: coords[tweetIdx][1] * ICON_SIZE,
				left: coords[tweetIdx][0] * ICON_SIZE
			});
		linkEl.append(iconEl);
		fragment.append(linkEl);
	});
	iconsEl.append(fragment);
}

function getRandomCoordinates(){
	return _.shuffle(coordinates);
}

function getCoordinatesFromPlaceholderMask(){
	var coordinates = [];
	var numRows = ICON_PLACEHOLDER_MASK.length;
	var numCols = ICON_PLACEHOLDER_MASK[0].length;
	for(var rowIdx = 0; rowIdx < numRows; ++rowIdx){
		var row = ICON_PLACEHOLDER_MASK[rowIdx];
		for(var colIdx = 0; colIdx < numCols; ++colIdx){
			if(row[colIdx]){
				coordinates.push([colIdx, rowIdx]);
			}
		}
	}
	return coordinates;
}

function getIconLimit(){
	return coordinates.length;
}
