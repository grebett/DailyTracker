var https = require('https');
var fs = require('fs');
var express = require('express');
var chalk = require('chalk');
var cors = require('cors');
var daily = require('./dailymotion-api.service.js');
var config = require('./config.js');

// current ID is:
process.env.videoId = config.videoId;

// express basic webserver
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(cors());

app.get('/', function (req, res) {
  res.send('hello world!');
});

app.get('/data', function (req, res) {
  res.sendFile(__dirname + '/audience.log');
});

var interval = null;
app.post('/start', function (req, res) {
  process.env.videoId = req.body.videoId;
  console.log(chalk.magenta('▃▃▃ start ▃▃▃'), 'starting monitoring ' + process.env.videoId);

  // https request on dailymotion API, appending audience each `callInterval` ms to `audience.log` file
  daily(process.env.videoId, ['onair', 'broadcasting'], true).then(function (video) {
    if (!video.onair && !video.broadcasting) {
      console.log(chalk.red('▃▃▃ error ▃▃▃'), video);
    }
    else {
      console.log(chalk.green('▃▃▃ log ▃▃▃'), video);
      interval = setInterval(function () {
        daily(process.env.videoId, ['audience'], false).then(function (video) {
          var data = new Date().getTime() + ':' + video.audience;
          console.log(chalk.green('▃▃▃ log ▃▃▃'), video);
          fs.appendFile('audience.log', data + '\n', function (err) {
            if (err) {
              console.log(chalk.red('▃▃▃ error ▃▃▃'), err);
            }
          });
        });
      }, config.callInterval);
    }
  });

  res.json('start monitoring ' + process.env.videoId);
});

app.get('/stop', function (req, res) {
  process.env.videoId = null;
  console.log(chalk.magenta('▃▃▃ stop ▃▃▃'), 'stopping monitoring ' + process.env.videoId);

  if (interval)
    clearInterval(interval);
  res.json('stop monitoring ' + process.env.videoId);
});

app.listen(config.port, function () {
  console.log(chalk.yellow('▃▃▃ server ▃▃▃'), 'server listening on port: ', config.port);
});



