const {GraphQLString} = require('graphql');
const pubsub = require('../../constants/pubsub');

module.exports = {
  type: GraphQLString,
  subscribe: () => pubsub.asyncIterator('emailAddressClaimCreated')
};
