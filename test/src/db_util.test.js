const db_func = (...args) => args,
  db = {none: db_func, any: db_func, one: db_func, many: db_func},
  sut = require('./../../src/db_util.js')(db);
test.each`
  table_input                                 | request_params
  ${['table', 'row1', 'row2', 'row3']}        |  ${{row1: 'row1_val', row2: 'row2_val'}}
  ${['table', 'row1', 'row2', 'row3']}        |  ${{row2: 'row1_val', row3: 'row2_val'}}
  `('$table_input : $request_params', ({table_input, request_params}) => {

  const object = sut(...table_input),
    result = {},
    req = {promised_params: request_params};

  result.select_all = object.select_all(req);
  result.select_where = object.select_where(req);
  result.insert_into = object.insert_into(req);
  result.insert_or_update = object.insert_or_update(req, 'row2');
  result.delete_from = object.delete_from(req);

  return expect(result).toMatchSnapshot();

});
