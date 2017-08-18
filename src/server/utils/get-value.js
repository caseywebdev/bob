const getConsulValue = require('./get-consul-value');
const getVault = require('./get-vault');
const rootVault = require('./root-vault');

module.exports = async ({env, value: {consul = {}, value, vault = {}}}) =>
  consul.path ? getConsulValue(consul) :
  vault.key && vault.path ?
    (await (env ? getVault({env}) : rootVault).get(vault.path))[vault.key] :
  value;
