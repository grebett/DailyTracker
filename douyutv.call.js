var request = require('request');

module.exports = function (videoId, cb) {
  request({
    url: 'http://www.douyutv.com/api/client/room/' + videoId
  }, cb);
};