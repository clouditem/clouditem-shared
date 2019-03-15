const jwt = require('express-jwt'),
  fetch = require('node-fetch'),
  cached_jwt_secret_fetch = (url, period) => {

    let cache = '',
      next_fetch = 0;

    return (req, payload, done) => {

      if (Date.now() < next_fetch)
        return done(cache);

      next_fetch = Date.now() + (60 * 1000 * period);
      return fetch(url)
        .then(res => cache = res)
        .then(res => done(null, res));

    };

  },
  create_jwt_middleware = options => {

    if (!options.hasOwnProperty('jwt_secret_url'))
      throw new Error('Missing property jwt_secret_url');
    if (!options.hasOwnProperty('jwt_secret_refresh_period'))
      throw new Error('Missing property jwt_secret_refresh_period');

    return jwt({
      secret: cached_jwt_secret_fetch(options.jwt_secret_url, options.jwt_secret_refresh_period),
      //getToken: req => //TODO do we need a custom JWT retrieval?
      credentialsRequired: options.require_credentials || false,
    });

  };

module.exports = {create_jwt_middleware};
