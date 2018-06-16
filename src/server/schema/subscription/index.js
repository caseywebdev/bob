const {GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Subscription',
  description: 'Queries for subscribing to data changes.',
  fields: () => ({
    buildStatusChanged: require('./build-status-changed')
  })
});
