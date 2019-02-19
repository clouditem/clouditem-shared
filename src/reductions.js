module.exports = {
  to_object: ({key, value}) => (accumulator, entry) => Object.assign(accumulator, {[key(entry)]: value(entry)}),
};
