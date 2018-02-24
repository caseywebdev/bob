const {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Permission',
  fields: () => ({
    createdAt: {type: new GraphQLNonNull(GraphQLString)},
    envId: {type: new GraphQLNonNull(GraphQLID)},
    env: {type: new GraphQLNonNull(require('../env'))},
    userId: {type: new GraphQLNonNull(GraphQLID)},
    role: {type: new GraphQLNonNull(GraphQLString)},
    updatedAt: {type: new GraphQLNonNull(GraphQLString)}
  })
});
