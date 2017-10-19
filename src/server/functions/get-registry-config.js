const getValue = require('./get-value');

module.exports = async ({env, env: {config: {docker: {registryConfig}}}}) =>
  getValue({env, value: registryConfig});
