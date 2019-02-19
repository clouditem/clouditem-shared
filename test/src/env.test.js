require('./../finally');
const sut = require('./../../src/env.js');

/* eslint-disable padded-blocks,brace-style*/
test.each`
input                            | env               | requested          |  test_name
${{PORT: undefined}}             |  ${{PORT: 8080}}  | ${['PORT']}        | ${'property present'}
${{PORT: undefined}}             |  ${{}}            | ${['PORT']}        | ${'property required but not present'}
${{PORT: 8080}}                  |  ${{}}            | ${['PORT']}        | ${'property absent, default set'}
${{PORT: port => port + 1}}      |  ${{PORT: 8080}}  | ${['PORT']}        | ${'func increment by one'}
${{}}                            |  ${{}}            | ${['PORT']}        | ${'property absent, but requested'}
${{PORT: () => { throw Error('test'); }}}   |  ${{PORT: 8080}}  | ${['PORT']}        | ${'func throw error with message test'}
`('$test_name : $env', ({input, env, requested}) => {
/* eslint-enable padded-blocks,brace-style*/
  process.env = env;
  let promise = Promise.resolve(Error('Error in Test'));
  try {

    const environment = sut(input);
    promise = Promise.all(requested.map(name => Promise.resolve()
      .then(() => ({[name]: environment[name]}))
    ))
      .then(properties => properties.reduce((accumulator, property) => Object.assign(accumulator, property), {}))
      .catch(err => err);

  } catch (err) {

    promise = Promise.resolve(err);

  }
  return promise.then(result => expect(result).toMatchSnapshot());

}
);
