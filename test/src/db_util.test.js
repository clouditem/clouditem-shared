const db = {any: (...args) => args, one: (...args) => args, many: (...args) => args},
  sut = require('./../../src/db_util.js')(db);
test.each`
  table_input                                 | request_params
  ${['table', 'row1', 'row2', 'row3']}        |  ${{row1: 'row1_val', row2: 'row2_val'}}
  ${['table', 'row1', 'row2', 'row3']}        |  ${{row2: 'row1_val', row3: 'row2_val'}}
  `('$table_input : $request_params', ({table_input, request_params}) => {

  const object = sut(...table_input),
    result = {};

  for (method in object)
    result[method] = object[method]({promised_params: request_params});
  return expect(result).toMatchSnapshot();

});
