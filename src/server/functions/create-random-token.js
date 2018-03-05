const {promisify} = require('util');
const bcrypt = require('bcrypt');
const config = require('../config');
const crypto = require('crypto');

const {tokenSize, tokenSaltRounds} = config;

const randomBytes = promisify(crypto.randomBytes);

module.exports = async () => {
  const token = (await randomBytes(tokenSize)).toString('hex');
  const tokenHash = await bcrypt.hash(token, tokenSaltRounds);
  return {token, tokenHash};
};
