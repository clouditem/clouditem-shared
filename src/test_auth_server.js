const express = require('express'),
  jwt = require('jsonwebtoken'),
  {create_router_according_to_mapping} = require('./route_util'),
  default_private_key = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIJUmxD+cWbhksl6Os3A7MgQYu1eLhcbkwpY2+kdEYTwRoAoGCCqGSM49
AwEHoUQDQgAE5hU0g65QNwW4JKUZ4VfpqfeonCFfZDPqIL3DNu4Wh3HFgJnJeAgV
n1zbLDM74qH5hsLbjLdDxpxuC5GEdpshxw==
-----END EC PRIVATE KEY-----`,
  default_public_key = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5hU0g65QNwW4JKUZ4VfpqfeonCFf
ZDPqIL3DNu4Wh3HFgJnJeAgVn1zbLDM74qH5hsLbjLdDxpxuC5GEdpshxw==
-----END PUBLIC KEY-----`;


module.exports = ({ // eslint-disable-line max-lines-per-function
  private_key = default_private_key,
  public_key = default_public_key,
  default_permission = {
    public_read: true,
    public_write: false,
    is_creator: false,
    user: 'Dummy',
  },
  item_to_permission_function,
  issuer = 'localhost',
  port = 9080,
}
) => {

  if (!private_key || !public_key)
    throw new TypeError('invalid private_key or public_key');

  const app = express(),
    sign = ({item_id, audience, rights = {}}) => {

      const resolve_name = name => [
        rights[name],
        item_to_permission_function && item_to_permission_function({item_id, audience, permission_name: name}),
        default_permission[name],
      ].find(el => el !== undefined);
      return new Promise((resolve, reject) => jwt.sign({
        item_id,
        user: resolve_name('user'),
        public_read: resolve_name('public_read'),
        public_write: resolve_name('public_write'),
        is_creator: resolve_name('is_creator'),
      }, private_key, {
        algorithm: 'ES256',
        expiresIn: '1h',
        issuer,
        audience,
      }, (err, token) => err
        ? reject(err)
        : resolve(token)
      ));

    };


  app.use(create_router_according_to_mapping({
    get: {
      '/:item_id/jwt': {
        request_parameters: ['item_id', 'audience'],
        promise: (req, res) => {

          const {item_id, audience} = req.promised_params;
          if (!audience)
            return Promise.reject(new Error('Invalid audience!'));
          return sign({item_id, audience}).then(token => res.status(200).send(token));

        }
        ,
      },
      '/public-key': (req, res) => Promise.resolve(
        res.status(200).send(public_key)
      ),
    },

  }));
  return {
    server: app.listen(port),
    sign,
    url: `http://localhost:${port}/public-key`,
  };

};
