const {GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Query',
  description: 'Queries for reading data.',
  fields: () => ({
    build: require('./build'),
    builds: require('./builds'),
    userEmailAddress: require('./user-email-address'),
    viewer: require('./viewer')
  })
});
