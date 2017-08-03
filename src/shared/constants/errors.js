const _ = require('underscore');

module.exports = {
  FORBIDDEN: _.extend(new Error('Forbidden'), {statusCode: 403}),
  NOT_FOUND: _.extend(new Error('Not Found'), {statusCode: 404}),
  UNAUTHORIZED: _.extend(new Error('Unauthorized'), {statusCode: 401}),
  WEB_SOCKET_ONLY: _.extend(
    new Error('This route is only available over WebSockets'),
    {statusCode: 400}
  )
};
