
const supertest = require('supertest'),
  // {unit_test} = require('../util.js'),
  sut = require('./../../src/route_util.js'),
  express = require('express'),
  send = str => (req, res) => res.status(200).send(str),
  mirror = fn => (req, res) => res.status(200).send(fn(req)),
  reject = str => () => Promise.reject(Error(str));

describe('routing', () => {

  test.each`
  input                                                           | req_method  | req_path          |  test_name
  ${{post: {'/path': send('done')}}}                              |  ${'post'}  | ${'/path'}        | ${'simple path'}
  ${{get: {'/:param': mirror(re => re.params.param)}}}            |  ${'get'}   | ${'/abrakadabra'} | ${'parameter mirror'}
  ${{get: {'/:param': mirror(re => re.params.param)}}}            |  ${'get'}   | ${'/'}            | ${'parameter mirror'}
  ${{get: {'/:param': send('/:param'), '/': send('root')}}}       |  ${'get'}   | ${'/'}            | ${'parameter root'}
  ${{get: {'/:param': send('/:param'), '/': send('root')}}}       |  ${'get'}   | ${'/abcdf'}       | ${'parameter root'}
  ${{get: {'/': send('root'), '/:param': send('/:param')}}}       |  ${'get'}   | ${'/abcdf'}       | ${'root parameter'}
  ${{get: {'/': send('root'), '/:param': send('/:param')}}}       |  ${'get'}   | ${'/'}            | ${'root parameter'}
  ${{get: {'/path': send('path'), '/:param': send('/:param')}}}   |  ${'get'}   | ${'/path'}         | ${'path parameter'}
  ${{get: {'/:param': send('/:param'), '/path/': send('path')}}}  |  ${'get'}   | ${'/path'}         | ${'parameter path'}
  ${{get: {'/sub/*': send('sub'), '/:param': send('/:param')}}}   |  ${'get'}   | ${'/st/sub'}      | ${'subpath parameter'}
  ${{get: {'/': reject('test_problem')}}}                         |  ${'get'}   | ${'/'}            | ${'rejection'}
  ${{error_handlers: {Error: (res, err) => res.send(`from handler: ${err}`)}, get: {'/': reject('test_problem')}}}  |  ${'get'}   | ${'/'} | ${'rejection with error handler'}
  `('$test_name: [$req_method $req_path]', ({input, req_method, req_path}) => {

  const app = express();
  app.use(sut.create_router_according_to_mapping(input));
  return Promise.resolve(supertest(app)[req_method](req_path))
    .then(({text, statusCode: code}) => expect({text, code}).toMatchSnapshot());

});

});

describe('middleware', () => {

  test.each`
  input                                                                     | req_body     |  test_name
  ${{json: undefined, promise: (req, res) => res.send(req.body)}}           |  ${'{}'}     | ${'json'}
  ${{json: '10mb', promise: (req, res) => res.send(req.body)}}              |  ${'{}'}     | ${'json with limit'}
  ${{promise: (req, res) => res.send(req.body), json: '10mb'}}              |  ${'{}'}     | ${'order reverse fail'}
  ${{ensure_logged_in: true, promise: (req, res) => res.send(req.body)}}    |  ${'{}'}     | ${'unauthorized redirects to login'}
  `('$test_name: [$req_body]', ({input, req_body}) => {

  const app = express();
  app.use(sut.create_router_according_to_mapping({post: {'/target': input}}));
  return Promise.resolve(supertest(app).post('/target')
    .send(req_body)).then(({text, statusCode: code}) => expect({text, code}).toMatchSnapshot());

});

  test.each`
  input                                                                         | req_headers     |  test_name
  ${{cors: undefined, promise: (req, res) => res.send(req.body)}}               |  ${{}}          | ${'cors'}
  ${{cors: {origin: 'ioot.org'}, promise: (req, res) => res.send(req.body)}}    |  ${{}}          | ${'cors allow ioot.org'}
  ${{promise: (req, res) => res.send(req.body)}}                                |  ${{}}          | ${'blank'}
`('$test_name: [$req_headers]', ({input, req_headers}) => {

  const app = express();
  app.use(sut.create_router_according_to_mapping({post: {'/target': input}}));
  return Promise.resolve(supertest(app).post('/target')).then(({header}) => expect(header).toMatchSnapshot({date: expect.anything()}));

});

  test('cors at root_level', () => {

    const app = express();
    app.use(sut.create_router_according_to_mapping({cors: undefined, post: {'/target': (req, res) => res.send('done')}}));
    return Promise.resolve(supertest(app).post('/target')).then(({header}) => expect(header).toMatchSnapshot({date: expect.anything()}));

  });
  describe('parameters', () => {

    test.each`
  request_parameters                              | req_path                                    |    req_body                           |   test_name
  ${['path_param', 'body_param', 'query_param']}  | ${'/from_path?query_param=from query'}      |    ${{body_param: {from: 'body'}}}    | ${'all'}
  ${['path_param']}                               | ${'/from_path?path_param=from query'}       |    ${{path_param: {from: 'body'}}}    | ${'path is first'}
  ${['body_param']}                               | ${'/from_path'}                             |    ${{}}                              | ${'error throws error message'}
  ${['body_param']}                               | ${'/from_path?body_param=from query'}       |    ${{body_param: {from: 'body'}}}    | ${'body is second'}
  ${['query_param']}                              | ${'/from_path?query_param=from query'}      |    ${{body_param: {from: 'body'}}}    | ${'query is third'}
  `('$test_name: $request_parameters', ({request_parameters, req_path, req_body}) => {

  const app = express();
  app.use(sut.create_router_according_to_mapping({post: {'/:path_param': {json: undefined, request_parameters, promise: ({promised_params}, res) => res.send({promised_params})}}}));
  return Promise.resolve(supertest(app).post(req_path)
    .send(req_body))
    .then(({text}) => expect(text).toMatchSnapshot());

});

  });

});

test('wrong methods do not throw exception and do not show up in possible methods', () => {

  const app = express();
  app.use(sut.create_router_according_to_mapping({ignored: {'/': send('this_should_not_possibly_happen')}}));
  return Promise.resolve(supertest(app).get('/'))
    .then(({text, statusCode}) => expect({text, statusCode}).toMatchSnapshot({statusCode: 405, text: expect.not.stringContaining('ignored')}));

});
