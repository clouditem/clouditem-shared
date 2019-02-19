
module.exports = db => (table, ...var_names) => ({
  select_all: (req, response) => db.any(`SELECT ${var_names.join(',')}  FROM ${table}`)
    .then(result => ({[table]: result}))
    .then(result => ({response, result})),
  select_where: (req, response) => db.one(`SELECT ${var_names.join(',')} FROM ${table} WHERE ${var_names
    .filter(var_name => req.promised_params[var_name])
    .map(var_name => `${var_name} = $\{${var_name}}`)
    .join(' AND ')}`, req.promised_params)
    .then(result => ({response, result})),
  insert_into: (req, response) => db.one(`INSERT INTO ${table} VALUES (${var_names.map(str => `$\{${str}}`).join(',')}) RETURNING *`, req.promised_params)
    .then(result => ({response, result})),
  delete_from: (req, response) => db.one(`DELETE FROM ${table} WHERE ${var_names.map(var_name => `${var_name} = $\{${var_name}}`).join(' AND ')} RETURNING *`, req.promised_params)
    .then(result => ({response, result})),
});
