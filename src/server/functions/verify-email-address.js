const {INVALID_TOKEN} = require('../../shared/constants/errors');
const bcrypt = require('bcrypt');
const getIdFromToken = require('./get-id-from-token');

module.exports = async ({db, token}) => {
  const id = getIdFromToken(token);
  const uea = await db('userEmailAddresses').where({id, userId: null}).first();
  if (!uea || !(await bcrypt.compare(token, uea.tokenHash))) {
    throw INVALID_TOKEN;
  }

  return uea;
};
