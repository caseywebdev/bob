const getVault = require('./get-vault');

module.exports = async ({
  env,
  env: {config: {docker: {registryConfig: {value, vault: {path, key} = {}}}}}
}) => value || JSON.parse((await (await getVault({env})).get(path))[key]);
