const present = params => name => params[name];

module.exports = db => (table, ...var_names) => {

  const var_list = var_names.join(','),
    filtered_where_clause = req => var_names
      .filter(present(req.promised_params))
      .map(var_name => `${var_name} = $\{${var_name}}`)
      .join(' AND ');
  return {
    select_all: () => db.any(`SELECT ${var_list}  FROM ${table}`),
    select_where: req => db.any(`SELECT ${var_list} FROM ${table} WHERE ${filtered_where_clause(req)}`, req.promised_params),
    insert_into: req => db.one(`INSERT INTO ${table} (${var_names
      .filter(present(req.promised_params))
      .join(',')}) VALUES (${var_names
      .filter(present(req.promised_params))
      .map(str => `$\{${str}}`)
      .join(',')}) RETURNING ${var_list}`, req.promised_params),
    delete_from: req => db.many(`DELETE FROM ${table} WHERE ${filtered_where_clause(req)} RETURNING ${var_list}`, req.promised_params),
  };

};
