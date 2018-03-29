const {GraphQLList, GraphQLNonNull} = require('graphql');
const hasPermission = require('../../../shared/functions/has-permission');
const {READ_USER_TOKEN} = require('../../../shared/constants/roles');

module.exports = {
  type: new GraphQLNonNull(new GraphQLList(
    new GraphQLNonNull(require('../user-token'))
  )),
  resolve: async ({id}, args, {db, userToken}) =>
    !userToken || userToken.userId !== id ? [] :
    hasPermission(READ_USER_TOKEN, userToken.roles) ?
      await db('userTokens').where({userId: id}) :
    [userToken]
};
