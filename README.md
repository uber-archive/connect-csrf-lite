# connect-csrf-lite [![Build status](https://travis-ci.org/uber/connect-csrf-lite.png?branch=master)](https://travis-ci.org/uber/connect-csrf-lite)

Basic CSRF validation middleware for [Connect](http://www.senchalabs.org/connect/)
using [csrf-lite](https://github.com/isaacs/csrf-lite). The implementation of
CSRF token session storage and retrieval is left entirely up to you.

## Installation

``` bash
npm install connect-csrf-lite
```

## Usage

``` js
var connect = require('connect');
var connectCsrf = require('connect-csrf-lite');
var utils = require('./utils');
var app = connect();

// Middleware to create/retrieve `req.csrfToken`. This example uses cookie sessions.
app.use(connect.cookieParser());
app.use(connect.cookieSession({ secret: 'my-secret' }));
app.use(function (req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = utils.createToken();
  }
  req.csrfToken = req.session.csrfToken;
  next();
});

app.use(connectCsrf());
```

The middleware takes the token set at `req.csrfToken` (configurable with the
`tokenKey` option) and validates it against `x-csrf-token` present in the
body (configurable with the `dataKey` option) for all requests that mutate state.

If a CSRF token is not set on the request object, one will be created for you.
You will still need to handle the session storage and retrieval for
subsequent requests.

## Constructor Options

``` js
connectCsrf(options);
```

Pass an object on instantiation with any of the following options:

- **tokenKey** `String` The key at which you have attached the csrf token onto
the `req` object. Defaults to `csrfToken`.

- **dataKey** `String` The key on the `req` object where the `x-csrf-token`
key/value pair can be found. Examples are `headers`, `query`, etc. Defaults to
`body`.
