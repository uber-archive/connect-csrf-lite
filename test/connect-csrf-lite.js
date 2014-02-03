var expect = require('chai').expect;
var express = require('express');
var request = require('request');
var connectCsrf = require('../lib/connect-csrf-lite');
var utils = require('./utils');

describe('An express server with connect-csrf-lite', function () {
  function createToken (req, res, next) {
    req.csrfToken = res.locals.csrfToken = 'my-token';
    next();
  }

  describe('with a POST request received to a csrf-ified endpoint', function () {
    utils.runServer(1337, [
      createToken,
      express.urlencoded(),
      connectCsrf(),
      function (req, res) {
        if (req.method === 'GET') {
          res.send({ 'x-csrf-token': req.csrfToken });
        } else {
          res.send('OK!');
        }
      }
    ]);

    describe('with a POST request received with a CSRF token', function () {
      utils.saveRequest('http://localhost:1337');
      before(function makeCSRFRequest (done) {
        utils._saveRequest({
          method: 'POST',
          url: 'http://localhost:1337',
          form: JSON.parse(this.body)
        }).call(this, done);
      });

      it('is allowed through', function () {
        expect(this.err).to.eql(null);
        expect(this.res.statusCode).to.eql(200);
        expect(this.body).to.equal('OK!');
      });
    });
    describe('with a POST request received without a CSRF token', function () {
      utils.saveRequest({
        method: 'POST',
        url: 'http://localhost:1337'
      });

      it('is rejected', function () {
        expect(this.err).to.eql(null);
        expect(this.res.statusCode).to.eql(403);
        expect(this.body).to.contain('Forbidden');
      });
    });
  });

  describe('with a request received and req.csrfToken not set', function () {
    utils.runServer(1337, [
      connectCsrf(),
      function (req, res, next) {
        res.send(req.csrfToken);
      }
    ]);
    utils.saveRequest('http://localhost:1337');

    it('should create a 32-char random token at req.csrfToken', function () {
      expect(this.err).to.eql(null);
      expect(this.res.statusCode).to.eql(200);
      expect(this.body).to.have.length(32);
    });
  });

  describe('with a request received to a form using csrfInput()', function () {
    utils.runServer(1337, [
      createToken,
      connectCsrf(),
      function (req, res, next) {
        res.send(res.locals.csrfInput());
      }
    ]);
    utils.saveRequest('http://localhost:1337');

    it('should include x-csrf-token input', function () {
      expect(this.err).to.eql(null);
      expect(this.res.statusCode).to.eql(200);
      expect(this.body).to.contain('type=hidden name=x-csrf-token value="my-token"');
    });
  });
});
