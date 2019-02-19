const failMaker = (status, message) => res => err => {

  if (err)
    console.dir(err);

  return res.status(status)
    .end(`${message}\n${err}`);

};
module.exports = {
  forbidden: failMaker(403, 'Forbidden'),
  not_found: failMaker(404, 'Not Found'),
  method_not_allowed: failMaker(405, 'Method not Allowed'),
  internal_server_error: failMaker(500, 'Internal Server Error'),
  not_implemented: failMaker(501, 'Not Implemented'),
  bad_request: failMaker(400, 'Bad Request'),
  too_many_requests: failMaker(429, 'Too Many Requests'),
};
