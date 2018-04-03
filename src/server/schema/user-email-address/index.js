const {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType
} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'UserEmailAddress',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID)},
    user: require('./user'),
    emailAddress: {type: new GraphQLNonNull(require('../email-address'))},
    createdAt: {type: new GraphQLNonNull(require('../datetime'))},
    updatedAt: {type: new GraphQLNonNull(require('../datetime'))}
  })
});
