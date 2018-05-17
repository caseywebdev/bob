const {token: {hashAlgorithm}} = require('../config');
const getDb = require('./get-db');
const getHash = require('./get-hash');
const verifyToken = require('./verify-token');

const ONE_HOUR = 1000 * 60 * 60;

module.exports = async ({token}) => {
  const userToken = await verifyToken({table: 'userTokens', token});

  const updates = {};
  if (userToken.tokenHashAlgorithm !== hashAlgorithm) {
    updates.tokenHash = getHash({algorithm: hashAlgorithm, buffer: token});
    updates.tokenHashAlgorithm = hashAlgorithm;
  }

  const now = new Date();
  if (now - userToken.lastUsedAt >= ONE_HOUR) updates.lastUsedAt = now;

  if (!Object.keys(updates).length) return userToken;

  const db = await getDb();
  return (
    await db('userTokens')
      .update({...updates, updatedAt: now})
      .where({id: userToken.id})
      .returning('*')
  )[0];
};
