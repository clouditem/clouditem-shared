Promise.prototype.finally = function (on_finally) { //eslint-disable-line

  return this.then(
    res => Promise.resolve(on_finally()).then(() => res),
    err => Promise.resolve(on_finally()).then(() => Promise.reject(err))
  );

};
