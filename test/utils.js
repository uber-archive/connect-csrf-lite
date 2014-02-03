var assert = require('assert');
var express = require('express');
var request = require('request');

exports.runServer = function (port, middlewares) {
  before(function () {
    assert(port, 'runServer expects a port');
    middlewares = middlewares || [];

    var app = express();
    middlewares.forEach(function (middleware) {
      app.use(middleware);
    });
    this.server = app.listen(port);
  });
  after(function (done) {
    this.server.close(done);
  });
};

exports._saveRequest = function _saveRequest (options) {
  return function _saveFn (done) {
    var self = this;
    request(options, function (err, res, body) {
      self.err = err;
      self.res = res;
      self.body = body;
      done();
    });
  };
};

exports.saveRequest = function saveRequest (options) {
  before(exports._saveRequest(options));
};
