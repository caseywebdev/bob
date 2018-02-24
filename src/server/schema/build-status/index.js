const {GraphQLEnumType} = require('graphql');

module.exports = new GraphQLEnumType({
  name: 'BuildStatus',
  description: 'Possible build statuses.',
  values: {
    pending: {},
    claimed: {},
    pulling: {},
    building: {},
    pushing: {},
    succeeded: {},
    cancelled: {},
    failed: {}
  }
});
