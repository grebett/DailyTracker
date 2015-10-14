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
        // so the audience field should target differents paths
        // if there is some undefined fields (i.e. live stream may be off), just ignore this call
        // and return, waiting for the next one (who knows, the stream may go on sooner or later?)
        switch (platform) {
          case 'douyutv':
            if (!body.data)
              return;
            audience = body.data.online;
            break;
          case 'twitch':
            if (!body.stream)
              return;
            audience = body.stream.viewers;
            break;
          case 'youtubeGaming':
            if (!body.items[0] || (body.items[0] && !body.items[0].liveStreamingDetails))
              return;
            audience = body.items[0].liveStreamingDetails.concurrentViewers;
            break;
          case 'dailymotion':
            if (body.audience === 0)
              return;
            audience = body.audience;
            break;
        }

        // pushing the data values in the logs document data property
        var timestamp = new Date().getTime();

        Logs.update(logs._id, {$push: {data: {timestamp: timestamp, value: audience}}})
          .then(function (success) {
            // just log the values for now in the app logs output
            console.log('[' + platform, '] ' + timestamp + ': ' + audience);
          }, function (error) {
            // or the errors...
            console.log('error', error);
          });
      });
    }, config.callInterval); // end of setInterval

    // pushing the new interval in the intervals glob
    process.intervals.push({
      logsId: logs._id,
      videoId: videoId,
      interval: interval
    });

    console.log(process.intervals); // temp

    // then resolve the promise with the new logs
    deferred.resolve(logs);
  }, function (error) {
    // or the error
    deferred.reject(error);
  });

  return deferred.promise;
};