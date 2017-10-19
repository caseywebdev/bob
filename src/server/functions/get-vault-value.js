const getVault = require('./get-vault');
const rootVault = require('./root-vault');

module.exports = async ({env, key, path}) => {
  const vault = env ? getVault({env}) : rootVault;
  const value = (await vault.get(path))[key];
  try { return JSON.parse(value); } catch (er) { return value; }
};
