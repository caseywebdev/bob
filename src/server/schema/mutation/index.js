const {GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Queries for creating, updating and deleting data.',
  fields: () => ({
    createEmailAddressClaim: require('./create-email-address-claim'),
    createUserToken: require('./create-user-token'),
    deleteUserToken: require('./delete-user-token'),
    signIn: require('./sign-in'),
    signOut: require('./sign-out'),
    signUp: require('./sign-up'),
    verifyEmailAddressClaim: require('./verify-email-address-claim')
  })
});
