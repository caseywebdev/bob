const {GraphQLScalarType} = require('graphql');
const {Kind: {STRING}} = require('graphql/language');

const UUID_RE = /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i;

const check = str => UUID_RE.test(str) ? str : undefined;

module.exports = new GraphQLScalarType({
  name: 'UUID',
  parseValue: check,
  serialize: check,
  parseLiteral: ({kind, value}) => kind === STRING ? check(value) : undefined
});
