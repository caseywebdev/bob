const getDb = require('./get-db');
const verifyToken = require('./verify-token');

module.exports = async ({token}) => {
  const {id} = await verifyToken({table: 'emailAddressClaims', token});
  const db = await getDb();
  return (
    await db('emailAddressClaims')
      .update({verifiedAt: new Date()})
      .where({id})
      .returning('*')
  )[0];
};
