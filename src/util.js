const is_present = val => Boolean(typeof val !== 'undefined' && val !== null),

  promise_presence = (name, val) => is_present(val)
    ? Promise.resolve(val)
    : Promise.reject(new TypeError(`expected ${name} to be present`)),

  promise_value_in_field_of_request = (name, field_or_fields, request) => promise_presence('Request', request)
    .then(() => request.promised_params = request.promised_params || {})
    .then(() => Array.isArray(field_or_fields)
      ? field_or_fields
      : [field_or_fields]
    )
    .then(fields => fields.some(field => request.hasOwnProperty(field) && request[field].hasOwnProperty(name)
      ? (request.promised_params[name] = request[field][name], true)
      : false
    ))
    .then(success => success
      ? Promise.resolve(request)
      : Promise.reject(new TypeError(`Request does not contain value [${name}] in any of the following fields: [${field_or_fields}]`))
    ),

  promise_value = value_name => ({in: fields => ({of_request: request => promise_value_in_field_of_request(value_name, fields, request)})});


module.exports = {
  promise_presence,
  promise_value,
};
