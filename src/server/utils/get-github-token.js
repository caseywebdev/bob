const getVault = require('./get-vault');

module.exports = async ({
  env,
  env: {config: {github: {token: {value, vault: {path, key} = {}}}}}
}) => value || (await (await getVault({env})).get(path))[key];
