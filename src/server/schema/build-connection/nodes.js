const {GraphQLList, GraphQLNonNull} = require('graphql');

module.exports = {
  type: new GraphQLNonNull(
    new GraphQLList(new GraphQLNonNull(require('../build')))
  ),
  resolve: async ({loader}) => await loader.load('records')
};
