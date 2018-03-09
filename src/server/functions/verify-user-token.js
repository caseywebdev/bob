const {INVALID_TOKEN} = require('../../shared/constants/errors');
const bcrypt = require('bcrypt');
const getIdFromToken = require('./get-id-from-token');

const ONE_DAY = 1000 * 60 * 60 * 24;

module.exports = async ({db, token, userId}) => {
  const id = getIdFromToken(token);
  const userToken = await db('userTokens').where({id, userId}).first();
  if (!userToken || !(await bcrypt.compare(token, userToken.tokenHash))) {
    throw INVALID_TOKEN;
  }

  const now = new Date();
  if (now - token.lastUsedAt < ONE_DAY) return userToken;

  return (
    await db('userTokens')
      .update({lastUsedAt: now, updatedAt: now})
      .where({id})
      .returning('*')
  )[0];
};
