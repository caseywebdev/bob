const _ = require('underscore');
const {INVALID_TOKEN} = require('../../shared/constants/errors');
const isUuid = require('./is-uuid');

const UUID_GROUPING_RE = /^(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})$/;

const toHex = str => Buffer.from(str, 'base64').toString('hex');

const formatUuid = str => str.replace(UUID_GROUPING_RE, '$1-$2-$3-$4-$5');

module.exports = token => {
  if (!_.isString(token)) throw INVALID_TOKEN;

  let [id] = token.split('.');
  try { id = toHex(id); } catch (er) { throw INVALID_TOKEN; }

  id = formatUuid(id);
  if (!isUuid(id)) throw INVALID_TOKEN;

  return id;
};
