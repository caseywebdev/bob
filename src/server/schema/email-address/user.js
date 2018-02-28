const {GraphQLNonNull} = require('graphql');
const getDb = require('../../functions/get-db');

module.exports = {
  type: new GraphQLNonNull(require('../user')),
  resolve: async ({id}) => {
    const db = await getDb();
    const [user] = await db('users').where({userId: id});
    return user;
  }
};
