const fetch = require('node-fetch'),
  sut = require('./../../src/test_auth_server'),
  jwt = require('jsonwebtoken'),
  input = { };
let sut_result = null;

beforeAll(() => sut_result = sut(input));
afterAll(() => sut_result.server.close());

test('returns public_key under url', () => fetch(sut_result.url).then(result => result.text())
  .then(text => expect(text).toMatchSnapshot()));

test.each`
rights
${undefined}
${{public_read: false}}
${{public_write: true}}
${{is_creator: true}}
${{user: 'a user'}}

`('sign $rights ', ({rights}) => sut_result.sign({item_id: 'item_id', audience: 'audience', rights}).then(signed_jwt => expect(jwt.decode(signed_jwt)).toMatchSnapshot({iat: expect.anything(), exp: expect.anything()})));

describe('jwt endpoint', () => {

  let jwt_url = null;
  beforeAll(() => jwt_url = `${sut_result.url.split('/').slice(0, -1)
    .concat(['test_item', 'jwt'])
    .join('/')}?audience=test_audience`);

  test('default public_key matches private key', () => fetch(sut_result.url)
    .then(result => result.text())
    .then(public_key => fetch(jwt_url)
      .then(res => res.text())
      .then(signed_jwt => jwt.verify(signed_jwt, public_key, {audience: 'test_audience'}))
      .then(verify_result => expect(verify_result).toMatchSnapshot({iat: expect.anything(), exp: expect.anything()}))));

});
