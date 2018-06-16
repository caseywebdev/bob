const getDb = require('./get-db');
const verifyToken = require('./verify-token');

module.exports = async ({token}) => {
  const eac = await verifyToken({table: 'emailAddressClaims', token});

  // EACs can only be used once, so delete immediately after verification.
  const db = await getDb();
  await db('emailAddressClaims').delete().where({id: eac.id});

  // TODO: Throw if EAC is too old

  return eac;
};
