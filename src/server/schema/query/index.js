const {GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Query',
  description: 'Queries for reading data.',
  fields: () => ({
    build: require('./build'),
    builds: require('./builds'),
    emailAddressFromToken: require('./email-address-from-token'),
    viewer: require('./viewer')
  })
});
