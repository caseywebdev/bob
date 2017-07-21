const _ = require('underscore');

module.exports = {
  NOT_FOUND: _.extend(new Error(), {statusCode: 404})
};
