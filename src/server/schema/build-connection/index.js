const {GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'BuildConnection',
  fields: () => ({
    cursor: require('./cursor'),
    nodes: require('./nodes'),
    total: require('./total')
  })
});
