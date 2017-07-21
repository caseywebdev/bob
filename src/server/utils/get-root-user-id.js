const config = require('../config');
const getVault = require('./get-vault');

const {rootUserId: {value, vault: {path, key}}, vault} = config;

module.exports = async () =>
  value || (await (await getVault({env: {config: {vault}}})).get(path))[key];
