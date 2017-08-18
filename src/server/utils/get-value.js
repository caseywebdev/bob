const _ = require('underscore');
const getConsulValue = require('./get-consul-value');
const getVault = require('./get-vault');
const rootVault = require('./root-vault');

module.exports = async ({env, value: {consul, value, vault: {key, path}}}) =>
  _.any(consul) ? getConsulValue(consul) :
  key && path ? (await (env ? getVault({env}) : rootVault).get(path))[key] :
  value;
