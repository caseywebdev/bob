const getConsulValue = require('./get-consul-value');
const getVaultValue = require('./get-vault-value');

module.exports = async ({env, value: {consul = {}, value, vault = {}}}) =>
  consul.path ? getConsulValue({...consul, env}) :
  vault.key && vault.path ? getVaultValue({...vault, env}) :
  value;
