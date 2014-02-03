var assert = require('assert');
var connect = require('connect');
var csrf = require('csrf-lite');
var extend = require('obj-extend');

module.exports = function (options) {
  options = extend({
    tokenKey: 'csrfToken',
    dataKey: 'body'
  }, options);

  return function connectCsrf (req, res, next) {
    // Grab the token off the request object or create one
    var token = req[options.tokenKey] = req[options.tokenKey] || csrf();

    // Create a helper function to print a csrf form input
    req.csrfInput = res.locals.csrfInput = function () {
      return csrf.html(token);
    };

    // CSRF validation
    // https://github.com/senchalabs/connect/blob/2.12.0/lib/middleware/csrf.js#L76
    if (!req.method.match(/^(GET|HEAD|OPTIONS)$/)) {
      var data = req[options.dataKey] || {};
      var valid = csrf.validate(data, token);
      if (!valid) {
        return next(connect.utils.error(403));
      }
    }

    next();
  };
};
