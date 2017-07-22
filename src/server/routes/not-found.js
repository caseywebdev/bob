const _ = require('underscore');

module.exports = {
  '*': ({query}) => {
    throw _.extend(
      new Error(`No route found for ${JSON.stringify(query)}`),
      {statusCode: 404}
    );
  }
};
