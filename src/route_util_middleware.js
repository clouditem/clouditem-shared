
const {promise_value} = require('./util'),
  body_parser = require('body-parser'),
  cors = require('cors'),
  error_handlers = {
    TypeError: (res, err) => res.status(400).send(`Bad Request\n${err}`),
    default: (res, err) => (console.dir(err), res.status(500).send(`Internal Server Error\n${err}`)),
  },
  bad_request = res => err => (error_handlers[err.name] || error_handlers.default)(res, err);


module.exports = {
  cors,
  error_handlers: obj => (Object.assign(error_handlers, obj), (req, res, next) => next()),
  json: (limit = '20mb') => body_parser.json({limit}),
  ensure_logged_in: () => (req, res, next) => {

    if (typeof req.user === 'string')
      return next();
    req.session = req.session || {};
    req.session.returnTo = req.orginalUrl || req.url;
    return res.redirect('/login');

  },
  request_parameters: string_or_array_of_params => (req, res, next) => {

    const params = typeof string_or_array_of_params === 'string'
      ? [string_or_array_of_params]
      : string_or_array_of_params;

    return Promise.all(
      params.map(param => promise_value(param).in(['params', 'body', 'query']).of_request(req))
    )
      .then(() => next())
      .catch(bad_request(res));

  },
  promise: promise => (req, res) => promise(req, res).catch(bad_request(res)),
  // routing_adjustment: callback => callback,
};
