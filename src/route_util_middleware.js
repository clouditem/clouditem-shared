const {promise_value} = require('./util'),
  body_parser = require('body-parser'),
  cors = require('cors'),
  error_handlers = {
    TypeError: (res, err) => res.status(400).send(`Bad Request\n${err}`),
    default: (res, err) => (console.dir(err), res.status(500).send(`Internal Server Error\n${err}`)),
  },
  bad_request = res => err => (error_handlers[err.name] || error_handlers.default)(res, err),
  express_jwt = require('express-jwt'),
  fetch = require('node-fetch'),
  cached_jwt_secret_fetch = (url, period) => {

    let cache = '',
      next_fetch = 0;

    return (req, payload, done) => {

      if (Date.now() < next_fetch)
        return done(null, cache);

      next_fetch = Date.now() + 60 * 1000 * period;
      return fetch(url)
        .then(res => res.text())
        .then(text => cache = text)
        .then(text => done(null, text));

    };

  };

module.exports = {
  cors,
  jwt: ({jwt_secret_url, jwt_secret_refresh_period, require_credentials = false}) => {

    if (!jwt_secret_url)
      throw new Error('Missing property jwt_secret_url');
    if (!jwt_secret_refresh_period)
      throw new Error('Missing property jwt_secret_refresh_period');

    return express_jwt({
      secret: cached_jwt_secret_fetch(jwt_secret_url, jwt_secret_refresh_period),
      credentialsRequired: require_credentials,
    });

  },
  error_handlers: obj => (Object.assign(error_handlers, obj), (req, res, next) => next()),
  json: (limit = '20mb') => body_parser.json({limit, type: () => true}),
  require_permissions: string_or_array_of_perms => (req, res, next) => {

    const permissions = Array.isArray(string_or_array_of_perms)
        ? string_or_array_of_perms
        : [string_or_array_of_perms],
      {user} = req;

    if (typeof user !== 'object')
      return bad_request(res)(new TypeError('No or invalid JWT given'));

    if (user.item_id !== req.promised_params.item_id)
      return bad_request(res)(new TypeError('JWT for wrong item given'));

    if (permissions.indexOf('read') !== -1
      && !user.public_read
      && !user.is_creator)
      return bad_request(res)(new TypeError('You do not have the \'read\' permission'));

    if (permissions.indexOf('write') !== -1
      && !user.public_write
      && !user.is_creator)
      return bad_request(res)(new TypeError('You do not have the \'write\' permission'));

    if (permissions.indexOf('creator') !== -1
      && !user.is_creator)
      return bad_request(res)(new TypeError('You do not have the \'creator\' permission'));

    return next();

  },
  ensure_logged_in: () => (req, res, next) => {

    if (typeof req.user === 'string')
      return next();
    req.session = req.session || {};
    req.session.returnTo = req.orginalUrl || req.url;
    return res.redirect('/login');

  },
  fixed_parameters: obj => (req, res, next) => {

    req.promised_params = {...obj, ...req.promised_params || {}};
    next();

  },
  request_parameters: string_or_array_of_params => (req, res, next) => {

    const params = Array.isArray(string_or_array_of_params)
      ? string_or_array_of_params
      : [string_or_array_of_params];

    return Promise.all(
      params.map(param => promise_value(param).in(['params', 'body', 'query'])
        .of_request(req))
    )
      .then(() => next())
      .catch(bad_request(res));

  },
  promise: promise => (req, res) => promise(req, res).catch(bad_request(res)),
  // routing_adjustment: callback => callback,
};
