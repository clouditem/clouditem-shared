const zealit = require('zealit');


module.exports = properties => {

  const env = {};
  for (const key in properties) {

    if (typeof properties[key] === 'function')
      env[key] = properties[key](process.env[key]);
    else if (typeof process.env[key] !== 'undefined')
      env[key] = process.env[key];
    else if (typeof properties[key] !== 'undefined') // eslint-disable-line no-negated-condition
      env[key] = properties[key];
    else
      throw Error(`environment property ${key} was not found and has no default`);

  }
  return zealit(env);

};
