const {promisify} = require('util');
const bcrypt = require('bcrypt');
const config = require('../config');
const crypto = require('crypto');
const uuid = require('uuid/v4');

const {tokenSize, tokenSaltRounds} = config;

const randomBytes = promisify(crypto.randomBytes);

module.exports = async ({
  db,
  name,
  req: {headers: {'user-agent': userAgent}, ip},
  roles,
  userId
}) => {
  const id = uuid();
  const token = await randomBytes(tokenSize).toString('hex');
  const tokenHash = await bcrypt.hash(token, tokenSaltRounds);
  return {
    ...await db('tokens').insert({
      id,
      name,
      tokenHash,
      roles: roles.reduce((roles, role) => roles | role, 0),
      userId,
      userAgent,
      ip
    }),
    token: id + token
  };
};
