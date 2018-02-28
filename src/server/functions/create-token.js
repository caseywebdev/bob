const {promisify} = require('util');
const config = require('../config');
const crypto = require('crypto');

const {tokenSize} = config;

const randomBytes = promisify(crypto.randomBytes);

module.exports = async () => await randomBytes(tokenSize).toString('hex');
