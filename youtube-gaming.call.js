//https://www.googleapis.com/youtube/v3/videos?part=snippet%2CliveStreamingDetails&id=ISGDNwwdrEQ&fields=items(id%2Csnippet(title%2CliveBroadcastContent)%2CliveStreamingDetails%2FconcurrentViewers)&key=AIzaSyCjo-rUJYc0-njCxBocZ9L4yMvPqZ5KExA

var request = require('request');
var config = require('./config');

module.exports = function (videoId, cb) {
  request({
    url: 'https://www.googleapis.com/youtube/v3/videos?part=snippet%2CliveStreamingDetails&id=' + videoId + "&fields=items(id%2Csnippet(title%2CliveBroadcastContent)%2CliveStreamingDetails%2FconcurrentViewers)&key=" + config.APIkeys.youtubeGaming,
    headers: {
      'Accept': 'application/vnd.twitchtv.v2+json',
      'Client-ID': config.APIkeys.twitch
    }
  }, cb);
};