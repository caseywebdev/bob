const getConsulValue = require('./get-consul-value');
const getVault = require('./get-vault');
const rootVault = require('./root-vault');

module.exports = async ({env, value: {consul, value, vault: {key, path}}}) =>
  value != null ? value :
  consul ? getConsulValue(consul) :
  (await (env ? getVault({env}) : rootVault).get(path))[key];
