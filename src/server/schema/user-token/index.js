const {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'UserToken',
  fields: () => ({
    id: {type: new GraphQLNonNull(require('../uuid'))},
    roles: {type: new GraphQLNonNull(require('../roles'))},
    name: {type: GraphQLString},
    token: {type: GraphQLString},
    user: require('./user'),
    ipAddress: {type: new GraphQLNonNull(GraphQLString)},
    userAgent: {type: new GraphQLNonNull(GraphQLString)},
    createdAt: {type: new GraphQLNonNull(require('../datetime'))},
    updatedAt: {type: new GraphQLNonNull(require('../datetime'))},
    lastUsedAt: {type: require('../datetime')}
  })
});
