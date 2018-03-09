const {GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Queries for creating, updating and deleting data.',
  fields: () => ({
    claimEmailAddress: require('./claim-email-address'),
    createUserToken: require('./create-user-token'),
    deleteUserToken: require('./delete-user-token'),
    signIn: require('./sign-in'),
    signOut: require('./sign-out'),
    signUp: require('./sign-up'),
    verifyEmailAddress: require('./verify-email-address')
  })
});
