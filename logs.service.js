//http://www.douyutv.com/api/client/room/279355
var request = require('request');
var q = require('q');
var config = require('./config');
var Logs = require('./logs.collection.js');

exports.start = function (videoId, platform) {
  var deferred = q.defer();
  var services = {
    youtubeGaming: require('./youtube-gaming.call.js'),
    dailymotion: require('./dailymotion.call.js'),
    twitch: require('./twitch.call.js'),
    douyutv: require('./douyutv.call.js')
  };

  if (!services[platform]) {
    deferred.reject('The requested platform does not exist or is not supported yet.');
    return deferred.promise;
  }

  // first we create the adequat logs document
  Logs.create({
    videoId: videoId,
    platform: platform,
    startedAt: new Date(),
  })
  .then(function (logs) {
    // then we start the interval function
    var interval = setInterval(function () {
      // which is basicly a get request then a mongodb storage of the data
      services[platform](videoId, function (error, response, body) {
        var audience, body = JSON.parse(body);

        // of course, all response are not formatted the same for every platforms
        switch (platform) {
          case 'douyutv':
            audience = body.data.online;
            break;
          case 'twitch':
            audience = body.stream.viewers;
            break;
          case 'youtubeGaming':
            audience = body.items[0].liveStreamingDetails.concurrentViewers;
            break;
          case 'dailymotion':
            audience = body.audience;
            break;
        }

        // pushing the data values in the logs document data property
        var timestamp = new Date().getTime();

        Logs.update(logs._id, {$push: {data: {timestamp: timestamp, value: audience}}})
          .then(function (success) {
            // just log the values for now in the app logs output
            console.log('success', 'new log> ' + timestamp + ' = ' + audience);
          }, function (error) {
            // or the errors...
            console.log('error', error);
          });
      });
    }, config.callInterval); // end of setInterval

    // pushing the new interval in the intervals glob
    process.intervals.push({
      videoId: videoId,
      interval: interval
    });

    // then resolve the promise with the new logs
    deferred.resolve(logs);
  }, function (error) {
    // or the error
    deferred.reject(error);
  });

  return deferred.promise;
};