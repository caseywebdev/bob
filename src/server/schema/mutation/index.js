const {GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Queries for creating, updating and deleting data.',
  fields: () => ({
    createToken: require('./create-token'),
    signIn: require('./sign-in'),
    signUp: require('./sign-up'),
    verifyEmailAddress: require('./verify-email-address')
  })
});
