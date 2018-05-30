const _ = require('underscore');
const {GraphQLScalarType} = require('graphql');
const {Kind: {NUMBER}} = require('graphql/language');
const roles = require('../../../shared/constants/roles');

const ALL_ROLES = _.reduce(roles, (roles, n) => roles | n, 0);

const check = n => n === 0 || (n & ALL_ROLES && n <= ALL_ROLES) ? n : undefined;

module.exports = new GraphQLScalarType({
  name: 'Roles',
  description:
    JSON
      .stringify(roles, null, 2)
      .split('\n')
      .map(line => `\n\n\`${line}\``)
      .join(''),
  parseValue: check,
  serialize: check,
  parseLiteral: ({kind, value}) => kind === NUMBER ? check(value) : undefined
});
