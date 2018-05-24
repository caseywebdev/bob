const verifyToken = require('./verify-token');

module.exports = async ({token}) =>
  verifyToken({table: 'emailAddressClaims', token});
