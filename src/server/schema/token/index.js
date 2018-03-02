const {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Token',
  fields: () => ({
    id: {type: new GraphQLNonNull(require('../uuid'))},
    roles: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(require('../role'))))},
    name: {type: GraphQLString},
    token: {type: GraphQLString},
    createdAt: {type: new GraphQLNonNull(GraphQLString)},
    updatedAt: {type: new GraphQLNonNull(GraphQLString)},
    lastUsedAt: {type: new GraphQLNonNull(GraphQLString)}
  })
});
