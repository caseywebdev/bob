const {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'UserEmailAddress',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID)},
    user: require('./user'),
    emailAddress: {type: new GraphQLNonNull(require('../email-address'))},
    createdAt: {type: new GraphQLNonNull(GraphQLString)},
    updatedAt: {type: new GraphQLNonNull(GraphQLString)}
  })
});
