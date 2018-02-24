const {GraphQLList, GraphQLNonNull} = require('graphql');
const Build = require('../build');
const getDb = require('../../functions/get-db');

module.exports = {
  type: new GraphQLNonNull(new GraphQLList(Build)),
  resolve: async () => (await getDb())('builds')
};
