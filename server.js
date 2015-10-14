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

  // error checking
  if (!platform || !videoId)
    return res.status(401).json('You should provide at least videoId AND platform values.');

  // check if there is not already an interval running
  for (var i = 0; i < process.intervals.length; i++) {
    if (process.intervals[i].videoId === videoId)
      return res.status(403).json('There is already a video monitoring for ' + videoId + '. Please stop it before launching another monitoring process.')
  }

  // let's start the intervals
  startLogs(videoId, platform)
    .then(function (result) {
      res.json(result);
    }, function (error) {
      res.json(error);
    });
});

app.post('/api/stop', function (req, res) { //NTS: later add a stoppedAt value in the logs document (need the docs id, not only the video_id)
  var videoId = req.body.videoId;

  // error checking
  if (!videoId)
    return res.status(401).json('You should provide the videoId value.');

  // serach for the interval stop it and delete it from the intervals glob
  for (var i = 0; i < process.intervals.length; i++) {
    if (process.intervals[i].videoId === videoId) {
      clearInterval(process.intervals[i].interval);
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



