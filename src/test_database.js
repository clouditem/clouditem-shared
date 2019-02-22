require('dotenv')
  .config();
const pgp = require('pg-promise')({});

let serial = 0;


module.exports = ({test_name, migration_function, environment}) => {

  const database_config = {
      host: environment.TEST_DB_HOST,
      database: environment.TEST_DB_DATABASE,
      user: environment.TEST_DB_USER,
      password: environment.TEST_DB_PASSWORD,
    },
    database_url = `postgresql://${database_config.user}:${database_config.password}@${database_config.host}`,


    db = pgp(database_config),
    drop_isolated_databases = () => db
      .any(`SELECT datname FROM pg_database \
           WHERE datname LIKE '${test_name}%';`)
      .then(pg_database => pg_database.map(entry => entry.datname))
      .then(isolated_database_list => Promise
        .all(isolated_database_list
          .map(isolation_database_name => db
            .none(`DROP DATABASE ${isolation_database_name};`)))),
    promise_isolated_database = (
      isolation_database_name = `${test_name}_${serial++}`,
    ) => db.none(`CREATE DATABASE ${isolation_database_name};`)
      .then(() => migration_function({database_url: `${database_url}/${isolation_database_name}`}))
      .then(() => pgp({...database_config, ...{database: isolation_database_name}})),
    starting_promise = drop_isolated_databases(test_name),
    result = database_receiving_function => starting_promise.then(() => promise_isolated_database())
      .catch(err => Promise.reject(Error(`Error while creating an isolated Database: [${err.toString()}]`)))
      .then(isolated_db => database_receiving_function(isolated_db));

  result.aquire = () => starting_promise.then(() => promise_isolated_database())
    .catch(err => Promise.reject(Error(`Error while creating an isolated Database: [${err.toString()}]`)));
  result.end = () => pgp.end();
  return result;

};
