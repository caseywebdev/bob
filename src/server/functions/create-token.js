const {promisify} = require('util');
const bcrypt = require('bcrypt');
const config = require('../config');
const crypto = require('crypto');
const toBase64url = require('./to-base64url');

const {tokenSize, tokenSaltRounds} = config;

const randomBytes = promisify(crypto.randomBytes);

module.exports = async ({id}) => {
  const token =
    toBase64url(Buffer.from(id.replace(/-/g, ''), 'hex')) +
    '.' +
    toBase64url(await randomBytes(tokenSize));
  return {token, tokenHash: await bcrypt.hash(token, tokenSaltRounds)};
};
