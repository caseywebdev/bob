const {GraphQLString} = require('graphql');
const pubsub = require('../../constants/pubsub');

module.exports = {
  type: GraphQLString,
  subscribe: () =>
    pubsub.asyncIterator([
      'env:1:build:status:changed',
      'env:2:build:status:changed',
      'env:3:build:status:changed'
    ])
};
