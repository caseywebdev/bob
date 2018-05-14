const {promisify} = require('util');
const config = require('../config');
const crypto = require('crypto');
const toBase64url = require('./to-base64url');

const {token: {hashAlgorithm, size}} = config;

const randomBytes = promisify(crypto.randomBytes);

const getHash = buffer => {
  const hash = crypto.createHash(hashAlgorithm);
  hash.update(buffer);
  return hash.digest();
};

module.exports = async ({id}) => {
  const token =
    toBase64url(Buffer.from(id.replace(/-/g, ''), 'hex')) +
    '.' +
    toBase64url(await randomBytes(size));
  return {
    token,
    tokenHash: getHash(token),
    tokenHashAlgorithm: hashAlgorithm
  };
};
