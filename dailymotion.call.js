//https://api.dailymotion.com/video/x2jbvkm?fields=audience
var request = require('request');
var config = require('./config');

module.exports = function (videoId, cb) {
  request({
    url: 'https://api.dailymotion.com/video/' + videoId + '?fields=audience',
    headers: {
      'Cache-Control':'no-cache'
    }
  }, cb);
};