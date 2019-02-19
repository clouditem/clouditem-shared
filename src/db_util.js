
module.exports = db => (table, ...var_names) => ({
  select_all: () => db.any(`SELECT ${var_names.join(',')}  FROM ${table}`),
  select_where: req => db.any(`SELECT ${var_names.join(',')} FROM ${table} WHERE ${var_names
    .filter(var_name => req.promised_params[var_name])
    .map(var_name => `${var_name} = $\{${var_name}}`)
    .join(' AND ')}`, req.promised_params),
  insert_into: req => db.one(`INSERT INTO ${table} VALUES (${var_names.map(str => `$\{${str}}`).join(',')}) RETURNING *`, req.promised_params),
  delete_from: req => db.one(`DELETE FROM ${table} WHERE ${var_names.map(var_name => `${var_name} = $\{${var_name}}`).join(' AND ')} RETURNING *`, req.promised_params),
});
