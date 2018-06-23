const {GraphQLList, GraphQLNonNull} = require('graphql');
const {READ_USER_TOKEN} = require('../../constants/roles');
const getDb = require('../../functions/get-db');
const hasPermission = require('../../functions/has-permission');

module.exports = {
  type: new GraphQLNonNull(new GraphQLList(
    new GraphQLNonNull(require('../user-token'))
  )),
  resolve: async ({id}, args, {userToken}) => {
    const db = await getDb();
    return (
      !userToken || userToken.userId !== id ? [] :
      hasPermission(READ_USER_TOKEN, userToken.roles) ?
        await db('userTokens').where({userId: id}) :
      [userToken]
    );
  }
};
