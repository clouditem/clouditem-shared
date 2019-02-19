const {Router: make_router} = require('express'),
  option_map = require('./route_util_middleware'),
  method_not_allowed_use_instead = possible_methods => (req, res) => Promise.resolve()
    .then(() => res.status(405)
      .send(`Method [${req.method}] is not allowed, use ${JSON.stringify(possible_methods)} instead`)),
  path_not_found_try_instead = possible_paths => (req, res) => Promise.resolve()
    .then(() => res.status(404)
      .send(`Path [${req.path}] was not found, try ${JSON.stringify(possible_paths)} instead or use another method`)),

  convert_path_object_to_path = obj => Object.keys(obj).map(key => option_map[key](obj[key])),
  make_path = path_description => typeof path_description === 'object'
    ? convert_path_object_to_path(path_description)
    : convert_path_object_to_path({promise: path_description}),
  make_path_router = method_description => {

    const path_router = make_router();
    Object.keys(method_description) // Object.keys respects property insertion order for String keys
      .forEach(path => path_router.all(path, make_path(method_description[path])));
    return path_router;

  },
  create_route_in_app = (app, host_description) => {

    const available_methods = [];

    Object.keys(host_description)
      .forEach(method => {

        if (option_map[method])
          app.all('*', option_map[method](host_description[method]));

        if (app[method]) {

          const path_router = make_path_router(host_description[method]);
          app[method]('*', path_router, path_not_found_try_instead(Object.keys(host_description[method])));
          available_methods.push(method);

        }

      });
    app.all('*', method_not_allowed_use_instead(available_methods));

  },
  create_router_according_to_mapping = mapping => {

    const router = make_router();
    create_route_in_app(router, mapping);
    return router;

  };
module.exports = {create_router_according_to_mapping};
