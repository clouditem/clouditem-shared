const zealit = require('zealit');


module.exports = properties => {

  const env = {};
  for (const key in properties) {

    if (typeof properties[key] === 'function')
      env[key] = properties[key](process.env[key]);
    else if (process.env[key] || properties[key])
      env[key] = process.env[key] || properties[key];
    else
      throw Error(`environment property ${key} was not found and has no default`);

  }
  return zealit(env);

};
