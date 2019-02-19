const {unit_test} = require('../util.js'),
  under_test = require('../../src/util.js');

describe('promise_value', () => {

  const circular_request = {},
    tests = [
      {name: 'api_key in query successfull', successfull: true, value: 'api_key', in: ['query'], request: {query: {api_key: {}}}},
      {name: 'api_key in body and query prefers first', successfull: true, value: 'api_key', in: ['body', 'query'], request: {query: {api_key: 'from query'}, body: {api_key: 'from body'}}},
      {name: 'api_key in query and body prefers first reversed', successfull: true, value: 'api_key', in: ['query', 'body'], request: {query: {api_key: 'from query'}, body: {api_key: 'from body'}}},
      {name: 'error with circular request structure does show normal error', successfull: false, value: 'api_key', in: ['body'], request: circular_request.body = circular_request},
      {name: 'no request', successfull: false, value: 'api_key', in: ['query'], request: undefined},
      {name: 'empty request', successfull: false, value: 'api_key', in: ['query'], request: {}},
      {name: 'no matching in', successfull: false, value: 'api_key', in: ['query'], request: {body: {api_key: {}}, params: {}}},
      {name: 'no matching in multiple', successfull: false, value: 'api_key', in: ['query', 'params'], request: {body: {api_key: {}}, params: {}}},
    ],
    make_test = test_description => unit_test()
      .given(() => test_description.request)
      .when(req => under_test.promise_value(test_description.value)
        .in(test_description.in)
        .of_request(req))
      .is_rejected(!test_description.successfull)
      .then(res => expect(res).toMatchSnapshot())
      .done();
  tests.forEach(test_description => test(
    `${test_description.name}`,
    make_test(test_description)
  ));

});
describe('promise_presence', () => {

  const tests = [
      {name: 'undefined', successfull: false, input: {name: 'test_input', value: undefined}, assertion: res => res.toMatchSnapshot()},
      {name: 'false', successfull: false, input: {name: 'test_input', value: false}, assertion: res => res.toMatchSnapshot()},
      {name: 'zero', successfull: false, input: {name: 'test_input', value: 0}, assertion: res => res.toMatchSnapshot()},
      {name: 'null', successfull: false, input: {name: 'test_input', value: null}, assertion: res => res.toMatchSnapshot()},
      {name: 'empty String', successfull: false, input: {name: 'test_input', value: ''}, assertion: res => res.toMatchSnapshot()},
      {name: 'name undefined', successfull: false, input: {name: undefined, value: undefined}, assertion: res => res.toMatchSnapshot()},
      {name: 'filled String', successfull: true, input: {name: 'test_input', value: 'bla'}, assertion: res => res.toEqual('bla')},
      {name: 'empty Object', successfull: true, input: {name: 'test_input', value: {}}, assertion: res => res.toEqual({})},
    ],
    make_test = test_description => unit_test()
      .given(() => test_description.input)
      .when(input => under_test.promise_presence(input.name, input.value))
      .is_rejected(!test_description.successfull)
      .then(res => test_description.assertion(expect(res)))
      .done();
  tests.forEach(test_description => test(
    `${test_description.name}`,
    make_test(test_description)
  ));

});
