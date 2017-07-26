const _ = require('underscore');
const getVault = require('./get-vault');

module.exports = async ({
  build: {buildArgs, ref, sha},
  env,
  env: {config: {docker: {buildVariables}}}
}) => {
  console.log('buildArgs', buildArgs);
  console.log('buildVariables', buildVariables);
  console.log('env', env);
  if (!_.isEmpty(buildArgs)) return {};

  const vars = {REF: ref, SHA: sha};
  for (let key in buildVariables) {
    const {value, vault: {path, key: vaultKey} = {}} = buildVariables[key];
    vars[key] = value || (await getVault({env}).get(path))[vaultKey];
  }
  console.log('vars', vars);
  return _.mapObject(buildArgs, str =>
    _.reduce(
      vars,
      (str, val, key) => str.replace(new RegExp(`{{${key}}}`, 'g'), val),
      str
    )
  );
};
