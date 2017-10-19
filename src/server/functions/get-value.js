const _ = require('underscore');
const getConsulValue = require('./get-consul-value');
const getVaultValue = require('./get-vault-value');

module.exports = async ({env, value: {consul = {}, value, vault = {}}}) =>
  consul.path ? getConsulValue(consul) :
  vault.key && vault.path ? getVaultValue(_.extend({}, vault, {env})) :
  value;
