const {GraphQLScalarType} = require('graphql');
const {Kind: {STRING}} = require('graphql/language');

module.exports = new GraphQLScalarType({
  name: 'Datetime',
  serialize: obj => obj && obj.toJSON(),
  parseValue: str => {
    const date = new Date(str);
    return isNaN(date.valueOf()) ? null : date;
  },
  parseLiteral: ({kind, value}) => kind === STRING ? value : null
});
