const {promisify} = require('util');
const config = require('../config');
const crypto = require('crypto');
const toBase64url = require('./to-base64url');
const getHash = require('./get-hash');
const uuid = require('uuid/v4');

const {token: {hashAlgorithm, size}} = config;

const randomBytes = promisify(crypto.randomBytes);

module.exports = async () => {
  const id = uuid();
  const token =
    toBase64url(Buffer.from(id.replace(/-/g, ''), 'hex')) +
    '.' +
    toBase64url(await randomBytes(size));
  return {
    id,
    token,
    tokenHash: getHash({algorithm: hashAlgorithm, buffer: token}),
    tokenHashAlgorithm: hashAlgorithm
  };
};
