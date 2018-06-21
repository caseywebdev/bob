const {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    avatarUrl: require('./avatar-url'),
    userEmailAddresses: require('./user-email-addresses'),
    userTokens: require('./user-tokens'),
    id: {type: new GraphQLNonNull(require('../uuid'))},
    name: {type: new GraphQLNonNull(GraphQLString)},
    createdAt: {type: new GraphQLNonNull(require('../datetime'))},
    updatedAt: {type: new GraphQLNonNull(require('../datetime'))}
  })
});
