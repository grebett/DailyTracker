// curl -i -H 'Accept: application/vnd.twitchtv.v2+json' -H 'Client-ID: bgk65dux68h0ejaq9c22ekhjry7a12f' 'https://api.twitch.tv/kraken/streams/ogaminglol'
var request = require('request');
var config = require('./config');

module.exports = function (videoId, cb) {
  request({
    url: 'https://api.twitch.tv/kraken/streams/' + videoId,
    headers: {
      'Accept': 'application/vnd.twitchtv.v2+json',
      'Client-ID': config.APIkeys.twitch
    }
  }, cb);
};