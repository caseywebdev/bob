const {GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Queries for creating, updating and deleting data.',
  fields: () => ({
    signIn: require('./sign-in'),
    createToken: require('./create-token')
  })
});
