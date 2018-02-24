const {GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    build: require('./build'),
    builds: require('./builds'),
    echo: require('./echo')
  })
});
