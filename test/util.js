const result_gatherer = () => ({
    sent: {},
    status: function status (recieved_status) {

      this.sent.status = recieved_status;
      this.status = this.method_called_twice('status');
      return this;

    },
    redirect: function redirect (recieved_redirect) {

      this.sent.redirect = recieved_redirect;
      this.redirect = this.method_called_twice('redirect');
      return this;

    },
    send (message) {

      this.sent.send = message;
      this.send = this.method_called_twice('send');
      return this;

    },
    method_called_twice (name) {

      return new_value => {

        throw new Error(`tried to call method ${name} of Response twice,\
           first containing ${this.sent[name]} and now again with ${new_value}`);

      };

    },
  }),

  integration_test = () => {

    const resolver = {};
    return {
      internal_promise: new Promise(resolve => {

        resolver.resolve = resolve;

      }),
      given (fn) {

        this.internal_promise = this.internal_promise.then(fn);
        this.and = this.given;
        return this;

      },
      when (fn) {

        this.internal_promise = this.internal_promise.then(fn);
        this.and = this.when;
        return this;

      },
      then (fn) {

        this.internal_promise = this.internal_promise.then(arg => {

          fn(arg);
          return arg;

        });
        this.and = this.then;
        return this;

      },
      done () {

        return done => {

          resolver.resolve();
          return this.internal_promise.then(() => done());

        };

      },
    };

  },

  unit_test = () => {

    const resolver = {};
    return {
      internal_promise: new Promise(resolve => {

        resolver.resolve = resolve;

      }),
      testing (promise_function) {

        this.internal_promise = this.internal_promise.then(() => promise_function()
          .then(sut => {

            this.sut = sut;

          }));
        this.testing = null;
        return this;

      },
      given (fn) {

        this.internal_promise = this.internal_promise.then(fn);
        this.and = this.given || this.and;
        this.given = null;
        return this;

      },
      when (fn) {

        this.internal_promise = this.internal_promise.then(input => fn(input, this.sut));
        this.and = this.when || this.and;
        this.when = null;
        return this;

      },
      is_rejected (flag) {

        if (flag) {

          this.internal_promise = this.internal_promise
            .then(result => Promise.reject(`The Promise should have been rejected,\
               but instead resulted in ${JSON.stringify(result)}`))
            .catch(err => err);

        }
        this.is_rejected = null;
        return this;

      },
      then (fn) {

        this.internal_promise = this.internal_promise.then(arg => {

          fn(arg);
          return arg;

        });
        this.and = this.then || this.and;
        this.then = null;
        return this;

      },
      done () {

        return done => {

          resolver.resolve();
          return this.internal_promise.then(() => done());

        };

      },
    };

  };

module.exports = {
  result_gatherer,
  unit_test,
  integration_test,
};
