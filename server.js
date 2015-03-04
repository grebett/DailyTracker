var https = require('https');
var daily = require('./dailymotion-api.service.js');
var chalk = require('chalk');
var config = require('./config.js');

// videoId(String), fields(Array), verbose(Bool)

daily('x155t0i', ['onair', 'title', 'url', 'updated_time'], true).then(function (video) {
  if (!video.onair) {
    console.log(chalk.red('▃▃▃ error ▃▃▃'), 'stream offline');
  }
  else {
    console.log(chalk.green('▃▃▃ log ▃▃▃'), 'stream online');
    setInterval(function () {
      daily('x155t0i', ['audience'], false).then(function (video) {
        console.log(chalk.green('▃▃▃ log ▃▃▃'), new Date().getTime(), video);
      });
    }, config.callInterval);
  }
});




