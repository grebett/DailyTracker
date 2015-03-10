var https = require('https');
var fs = require('fs');
var express = require('express');
var chalk = require('chalk');
var cors = require('cors');
var daily = require('./dailymotion-api.service.js');
var config = require('./config.js');

// express basic webserver
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(cors());

app.get('/', function (req, res) {
  res.send('hello world!');
});

app.get('/data/:id', function (req, res) {
  res.sendFile(__dirname + '/audience.' + req.params.id + '.log');
});

var videos = [];
app.post('/start', function (req, res) {
  videoId = req.body.videoId;

  // looking if the video is not already monitored
  videos.forEach(function (video) {
    if (video.id == videoId)
      return ;
  });

  console.log(chalk.magenta('▃▃▃ start ▃▃▃'), 'starting monitoring ' + videoId);

  // https request on dailymotion API, appending audience each `callInterval` ms to `audience.log` file
  daily(videoId, ['onair', 'broadcasting'], true).then(function (video) {
    if (!video.onair && !video.broadcasting) {
      console.log(chalk.red('▃▃▃ error ▃▃▃'), video);
    }
    else {
      console.log(chalk.green('▃▃▃ log ▃▃▃'), video);

      // aargh, closure !
      var data = "";
      (function (videoId, data) {
        var interval = setInterval(function () {
          global.gc();
          daily(videoId, ['audience'], false).then(function (video) {
            data = new Date().getTime() + ':' + video.audience;
            console.log(chalk.green('▃▃▃ log ▃▃▃ ' + videoId + ':'), video);
            fs.appendFile('audience.' + videoId + '.log', data + '\n', function (err) {
              if (err) {
                console.log(chalk.red('▃▃▃ error ▃▃▃'), err);
              }
            });
          });
        }, config.callInterval);
        // adding video + interval to videos array
        videos.push({id: videoId, interval: interval});
      })(videoId, data);
    }
  });

  res.json('start monitoring ' + videoId);
});

app.post('/stop', function (req, res) {
  var videoId = req.body.videoId;
  console.log(chalk.magenta('▃▃▃ stop ▃▃▃'), 'stopping monitoring ' + videoId);

  if (videos.length) {
    videos.forEach(function (video, i) {
      if (video.id == videoId) {
        clearInterval(video.interval);
        delete videos[i];
      }
    });
  }
  res.json('stop monitoring ' + videoId);
});

app.listen(config.port, function () {
  console.log(chalk.yellow('▃▃▃ server ▃▃▃'), 'server listening on port: ', config.port);
});



