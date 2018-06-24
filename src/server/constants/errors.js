const _ = require('underscore');

module.exports = _.mapObject({
  FORBIDDEN: _.extend(new Error('Forbidden'), {statusCode: 403}),
  NOT_FOUND: _.extend(new Error('Not Found'), {statusCode: 404}),
  UNAUTHORIZED: _.extend(new Error('Unauthorized'), {statusCode: 401}),
  INVALID_TOKEN: _.extend(
    new Error('Supplied token is invalid or expired'),
    {statusCode: 400}
  )
}, (error, id) => error.message = `${error.message} (id:${id})`);
