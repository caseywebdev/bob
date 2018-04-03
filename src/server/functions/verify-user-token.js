const {INVALID_TOKEN} = require('../../shared/constants/errors');
const {tokenSaltRounds} = require('../config');
const bcrypt = require('bcrypt');
const getIdFromToken = require('./get-id-from-token');

const ONE_DAY = 1000 * 60 * 60 * 24;

module.exports = async ({db, token, userId}) => {
  const id = getIdFromToken(token);
  const sql = db('userTokens').where({id});
  if (userId) sql.where({userId});
  const userToken = await sql.first();
  if (!userToken || !(await bcrypt.compare(token, userToken.tokenHash))) {
    throw INVALID_TOKEN;
  }

  const updates = {};
  if (bcrypt.getRounds(userToken.tokenHash) !== tokenSaltRounds) {
    updates.tokenHash = await bcrypt.hash(token, tokenSaltRounds);
  }

  const now = new Date();
  if (now - userToken.lastUsedAt >= ONE_DAY) updates.lastUsedAt = now;

  if (!Object.keys(updates).length) return userToken;

  return (
    await db('userTokens')
      .update({...updates, updatedAt: now})
      .where({id})
      .returning('*')
  )[0];
};
