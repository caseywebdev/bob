const verifyToken = require('./verify-token');

module.exports = async ({token}) =>
  verifyToken({table: 'userEmailAddresses', token});
