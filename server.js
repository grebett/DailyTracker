var https = require('https');
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var chalk = require('chalk');
var cors = require('cors');
var config = require('./config.js');
var Logs = require('./logs.collection.js');
var startLogs = require('./logs.service.js').start;

//////////////////////////
// express basic webserver
//////////////////////////

var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());


//////////////
// routes
//////////////

app.post('/api/start', function (req, res) {
  var videoId = req.body.videoId;
  var platform = req.body.platform;
  var services = {
    youtubeGaming: require('./youtube-gaming.call.js'),
    dailymotion: require('./dailymotion.call.js'),
    twitch: require('./twitch.call.js'),
    douyutv: require('./douyutv.call.js')
  };

  // error checking
  if (!platform || !videoId)
    return res.status(401).json('You should provide at least videoId AND platform values.');

  // check if there is not already an interval running
  for (var i = 0; i < process.intervals.length; i++) {
    if (process.intervals[i].videoId === videoId)
      return res.status(403).json('There is already a video monitoring for ' + videoId + '. Please stop it before launching another monitoring process.')
  }

  // before starting, try a first call to check if the provided id is correct and existing
  if (!services[platform])
    return res.status(404).json('The requested platform does not exist or is not supported yet.');
  else {
    services[platform](videoId, function (error, response, body) {
      body = JSON.parse(body);
      if (error)
        return res.json(error);

      // body items for youtube, error for the 3 other video providers
      if (body.error || (body.items && body.items.length === 0))
        return res.status(401).json('The provided id does not match any videos for the platform mentionned.');
      else {
        // let's start the intervals
        startLogs(videoId, platform)
          .then(function (result) {
            res.json(result);
          }, function (error) {
            res.json(error);
          });
      }
    });
  }
});

app.post('/api/stop', function (req, res) {
  var videoId = req.body.videoId;

  // error checking
  if (!videoId)
    return res.status(401).json('You should provide the videoId value.');

  // search for the interval stop it and delete it from the intervals glob
  for (var i = 0; i < process.intervals.length; i++) {
    if (process.intervals[i].videoId === videoId) {
      // stop the interval
      clearInterval(process.intervals[i].interval);

      // set the stoppedAt date in the logs doc
      Logs.update(process.intervals[i].logsId, {$set: {stoppedAt: new Date()}})
        .then(function (success) {
          // just log the values for now in the app logs output
          console.log('success', 'logs doc updated.');
        }, function (error) {
          // or the errors...
          console.log('error', error);
        });

      // lastly, remove the interval from the glob
      process.intervals.splice(i, 1);

      return res.status(200).json('The video monitoring for ' + videoId + ' has been stopped.');
    }
  }
  res.status(404).json('The videoId provided does not appear to be monitored for now.');
});

app.get('/api/logs', function (req, res) {
  var query = '';

  // user can search item greater than provided date
  if (req.query.date)
    query = {startedAt: {$gte: new Date(parseInt(req.query.date)).toISOString()}};

  Logs.find(query)
    .then(function (result) {
      res.status(200).json(result);
    },
    function (error) {
      res.status(500).json(error);
    });
});

app.get('/api/logs/:_id', function (req, res) {
  Logs.findOne({_id: req.params._id})
    .then(function (result) {
      res.status(200).json(result);
    },
    function (error) {
      res.status(500).json(error);
    });
});

app.get('/api/intervals', function (req, res) {
  res.json(process.intervals);
});

////////////////////
// launching server
////////////////////

app.listen(config.port, function () {
  process.intervals = [];
  console.log(chalk.green('-> ') + 'server listening on port ' + config.port);

  // connect to mongodb
  if (!mongoose.connection.readyState) { // prevents double connection
    mongoose.connect(config.mongo.uri, config.mongo.options, function (error) {
      if (error)
        console.log(chalk.red('-> ') + error);
      else
        console.log(chalk.green('-> ') + 'mongodb connection success');
    });
  }
});



