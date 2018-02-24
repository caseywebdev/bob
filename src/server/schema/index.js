const {GraphQLSchema} = require('graphql');

module.exports = new GraphQLSchema({
  mutation: require('./mutation'),
  query: require('./query'),
  subscription: require('./subscription')
});
