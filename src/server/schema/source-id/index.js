const {GraphQLEnumType} = require('graphql');

module.exports = new GraphQLEnumType({
  name: 'SourceId',
  description: 'Possible source ID values',
  values: {
    github: {}
  }
});
