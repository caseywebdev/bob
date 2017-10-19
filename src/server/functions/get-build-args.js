const _ = require('underscore');
const getValue = require('./get-value');

module.exports = async ({
  build: {buildArgs, ref, sha},
  env,
  env: {config: {docker: {buildVariables}}}
}) => {
  if (_.isEmpty(buildArgs)) return {};

  const vars = {REF: ref, SHA: sha};
  for (let key in buildVariables) {
    vars[key] = await getValue({env, value: buildVariables[key]});
  }

  return _.mapObject(buildArgs, str =>
    _.reduce(
      vars,
      (str, val, key) => str.replace(new RegExp(`{{${key}}}`, 'g'), val),
      str
    )
  );
};
