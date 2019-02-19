
const {bad_request} = require('./failures.js'),
  {promise_value} = require('./util'),
  body_parser = require('body-parser'),
  cors = require('cors');
module.exports = {
  cors,
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
    let promise_accumulator = Promise.resolve();
    params.forEach(param => promise_accumulator = promise_accumulator.then(() => promise_value(param).in(['params', 'body', 'query'])
      .of_request(req)));
    return promise_accumulator.then(() => next()).catch(bad_request(res));

  },
  promise: promise => (req, res) => promise(req, res).catch(bad_request(res)),
  // routing_adjustment: callback => callback,
};
