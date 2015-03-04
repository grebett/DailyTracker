'use strict';

var https = require('https');
var chalk = require('chalk');
var q = require('q');

module.exports = function (videoId, fields, verbose) {
  var options = {
    host: 'api.dailymotion.com',
    path: '/video/' + videoId + '?fields=' + fields.join(',')
  };
  var deferred = q.defer();

  if (verbose)
    console.log(chalk.cyan('▃▃▃ options ▃▃▃'), options);

  var req = https.get(options, function (res) {
    if (verbose) {
      console.log(chalk.cyan('▃▃▃ status ▃▃▃'), res.statusCode);
      console.log(chalk.cyan('▃▃▃ headers ▃▃▃'), JSON.stringify(res.headers));
    }

    var data = "";
    res.on('data', function (chunk) {
      data += chunk.toString();
    });

    res.on('end', function () {
      var json = JSON.parse(data);

      if (verbose) {
        console.log(chalk.yellow('▃▃▃ data ▃▃▃'), data);
        console.log(chalk.green('▃▃▃ json ▃▃▃'), json);
      }

      deferred.resolve(json);
    });
  });

  req.end();
  req.on('error', function (err) {
    if (verbose) {
      console.log(chalk.red('▃▃▃ error ▃▃▃'), err);
    }
  });

  return deferred.promise;
};


