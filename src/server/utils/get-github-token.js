const getValue = require('./get-value');

module.exports = async ({env, env: {config: {github: {token}}}}) =>
  getValue({env, value: token});
