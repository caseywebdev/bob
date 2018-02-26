const {GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    increment: require('./increment'),
    signIn: require('./sign-in')
  })
});
