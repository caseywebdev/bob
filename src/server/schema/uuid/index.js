const {GraphQLScalarType} = require('graphql');
const {Kind: {STRING}} = require('graphql/language');
const isUuid = require('../../functions/is-uuid');

const check = str => isUuid(str) ? str : null;

module.exports = new GraphQLScalarType({
  name: 'UUID',
  parseValue: check,
  serialize: check,
  parseLiteral: ({kind, value}) => kind === STRING ? check(value) : null
});
