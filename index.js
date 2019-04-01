/* eslint-disable global-require*/
module.exports = {
  env: () => require('./src/env'),
  reductions: () => require('./src/reductions'),
  db_util: () => require('./src/db_util'),
  route_util: () => require('./src/route_util'),
  test_database: () => require('./src/test_database'),
  test_auth_server: () => require('./src/test_auth_server'),
};
