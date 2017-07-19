const config = require('../config');
const getVault = require('./get-vault');
const memoize = require('./memoize');

const {rootToken: {value, vault: {path, key}}, vault} = config;

module.exports = memoize(async () =>
  value || (await (await getVault({env: {config: {vault}}})).get(path))[key]
);
