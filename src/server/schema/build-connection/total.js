const {GraphQLInt} = require('graphql');

module.exports = {
  type: GraphQLInt,
  resolve: async ({loader}) => (await loader.load('total'))[0].count
};
