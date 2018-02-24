const {GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    one: require('./one')
  })
});
