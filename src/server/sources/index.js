const _ = require('underscore');

module.exports = _.indexBy([
  require('./github')
], 'id');
