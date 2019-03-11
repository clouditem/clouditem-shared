const present = params => name => params[name];

module.exports = db => (table, ...var_names) => {

  const var_list = var_names.join(','),
    filtered_parameter = req => var_names
      .filter(present(req.promised_params)),
    filtered_where_clause = req => filtered_parameter(req)
      .map(var_name => `${var_name} = $\{${var_name}}`)
      .join(' AND '),
    insert_clause = req => `INSERT INTO ${table} (${filtered_parameter(req)
      .join(',')}) VALUES (${filtered_parameter(req)
      .map(str => `$\{${str}}`)
      .join(',')})`;
  return {
    select_all: () => db.any(`SELECT ${var_list}  FROM ${table}`),
    select_where: req => db.any(`SELECT ${var_list} FROM ${table} WHERE ${filtered_where_clause(req)}`, req.promised_params),
    insert_into: req => db.one(`${insert_clause(req)} RETURNING ${var_list}`, req.promised_params),
    insert_or_update: (req, identifier) => db.one(`${insert_clause(req)
    } ON CONFLICT (${identifier}) DO UPDATE SET ${filtered_parameter(req)
      .filter(str => str !== identifier)
      .map(str => `${str} = $\{${str}}`)
      .join(',')} RETURNING ${var_list}`, req.promised_params),
    delete_from: req => db.many(`DELETE FROM ${table} WHERE ${filtered_where_clause(req)} RETURNING ${var_list}`, req.promised_params),
  };

};
