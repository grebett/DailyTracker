var https = require('https');
var fs = require('fs');
var express = require('express');
var daily = require('./dailymotion-api.service.js');
var chalk = require('chalk');
var config = require('./config.js');

// https request on dailymotion API, appending audience each `callInterval` ms to `audience.log` file
daily(config.videoId, ['onair'], false).then(function (video) {
  if (!video.onair) {
    console.log(chalk.red('▃▃▃ error ▃▃▃'), 'stream offline');
  }
  else {
    console.log(chalk.green('▃▃▃ log ▃▃▃'), 'stream online');
    setInterval(function () {
      daily('x155t0i', ['audience'], false).then(function (video) {
        var data = new Date().getTime() + ':' + video.audience;
        console.log(chalk.green('▃▃▃ log ▃▃▃'), data);
        fs.appendFile('audience.log', data + '\n', function (err) {
          if (err) {
            console.log(chalk.red('▃▃▃ error ▃▃▃'), err);
          }
        });
      });
    }, config.callInterval);
  }
});

// express basic webserver
var app = express();

app.get('/', function (req, res) {
  res.send('hello world!');
});

app.get('/data', function (req, res) {
  res.sendFile(__dirname + '/audience.log');
});

app.listen(config.port, function () {
  console.log(chalk.yellow('▃▃▃ server ▃▃▃'), 'server listening on port: ', config.port);
});



