const {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'UserToken',
  fields: () => ({
    id: {type: new GraphQLNonNull(require('../uuid'))},
    roles: require('./roles'),
    name: {type: GraphQLString},
    token: {type: GraphQLString},
    user: require('./user'),
    createdAt: {type: new GraphQLNonNull(GraphQLString)},
    updatedAt: {type: new GraphQLNonNull(GraphQLString)},
    lastUsedAt: {type: new GraphQLNonNull(GraphQLString)}
  })
});
