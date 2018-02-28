const {GraphQLList, GraphQLNonNull} = require('graphql');
const getDb = require('../../functions/get-db');

module.exports = {
  type: new GraphQLNonNull(new GraphQLList(
    new GraphQLNonNull(require('../email-address'))
  )),
  resolve: async ({id}) => {
    const db = await getDb();
    return await db('emailAddresses').where({userId: id});
  }
};
