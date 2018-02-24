const {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Permission',
  fields: () => ({
    createdAt: {type: GraphQLNonNull(GraphQLString)},
    envId: {type: GraphQLNonNull(GraphQLID)},
    env: {type: GraphQLNonNull(require('../env'))},
    userId: {type: GraphQLNonNull(GraphQLID)},
    role: {type: GraphQLNonNull(GraphQLString)},
    updatedAt: {type: GraphQLNonNull(GraphQLString)}
  })
});
