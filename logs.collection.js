'use strict';

var mongoose = require('mongoose');
var q = require('q');
var Logs = mongoose.model('Logs', new mongoose.Schema({ // NTS: some inconstancy between string and Date for date values
  videoId: String,
  platform: String,
  startedAt: Date,
  stoppedAt: Date,
  data: [{
    timestamp: String,
    value: Number
  }]
}));

// we abstract the results handlePromise in a static method to avoid code repetition
function handlePromise (error, result, deferred) {
  if (error)
    deferred.reject(error);
  else
    deferred.resolve(result);
}

exports.find = function (query, lean, select) {
  var deferred = q.defer();
  var req = Logs.find(query);

  // select only returns the selecting fields
  if (select)
    req.select(select);
  // lean returns a plain JS object and not a mongoose document
  if (lean)
    req = req.lean();

  req.exec(function (error, result) {
    handlePromise(error, result, deferred);
  });

  return deferred.promise;
};


exports.findOne = function (query, lean, select) {
  var deferred = q.defer();
  var req = Logs.findOne(query);

  // select only returns the selecting fields
  if (select)
    req.select(select);
  // lean returns a plain JS object and not a mongoose document
  if (lean)
    req = req.lean();

  req.exec(function (error, result) {
    handlePromise(error, result, deferred);
  });

  return deferred.promise;
};

exports.create = function (data) {
  var deferred = q.defer();

  Logs.create(data, function (error, result) {
    handlePromise(error, result, deferred);
  });

  return deferred.promise;
};


exports.update = function (_id, data, lean, select) {
  var deferred = q.defer();
  var req = Logs.findOneAndUpdate({_id: _id}, data, {new: true});

  // select only returns the selecting fields
  if (select)
    req.select(select);
  // lean returns a plain JS object and not a mongoose document
  if (lean)
    req = req.lean();

  req.exec(function (error, result) {
    handlePromise(error, result, deferred);
  });

  return deferred.promise;
};


exports.delete = function (_id) {
  var deferred = q.defer();

  Logs.findByIdAndRemove(_id, function (error, result) {
    handlePromise(error, result, deferred);
  });

  return deferred.promise;
};