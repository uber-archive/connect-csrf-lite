var assert = require('assert');
var express = require('express');

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
