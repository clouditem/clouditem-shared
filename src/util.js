const promise_presence = (name, x) => new Promise((resolve, reject) => {

    if (x) { // Undefined and null are falsy

      resolve(x);

    } else {

      reject(Error(`expected ${name} to be present`));

    }

  }),

  promise_field = (value, key) => promise_presence('value', value)
    .then(() => promise_presence(`value[${key}]`, value[key]))
    .catch(() => Promise.reject(new Error(`expected ${key} to be present`))),

  promise_value_in_field_of_request = (value_name, fields, request) => promise_presence('Request', request)
    .then(present_request => (fields.filter
      ? fields
      : [fields]
    )
      .filter(field => present_request[field]))
    .then(present_fields => present_fields.filter(field => request[field][value_name]))
    .then(present_fields => present_fields.map(field => request[field][value_name]))
    .then(fields_containing_value => fields_containing_value.shift() || Promise.reject(Error(`Request  does not contain value [${value_name}] in any of the following fields: [${fields}]`)))
    .then(value => request.promised_params
      ? request.promised_params[value_name] = value
      : request.promised_params = {[value_name]: value}
    )
    .then(() => request),

  promise_value = value_name => ({in: fields => ({of_request: request => promise_value_in_field_of_request(value_name, fields, request)})});


module.exports = {
  promise_presence,
  promise_field,
  promise_value,
};
