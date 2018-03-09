const {GraphQLScalarType} = require('graphql');
const {Kind: {STRING}} = require('graphql/language');

const EMAIL_RE = /^[\w.%+-]+@[a-z\d.-]+\.[a-z]{2,}$/i;

const check = str => EMAIL_RE.test(str) ? str : undefined;

module.exports = new GraphQLScalarType({
  name: 'EmailAddress',
  parseValue: check,
  serialize: check,
  parseLiteral: ({kind, value}) => kind === STRING ? check(value) : undefined
});
