const {GraphQLList, GraphQLNonNull} = require('graphql');
const hasPermission = require('../../../shared/functions/has-permission');

module.exports = {
  type: new GraphQLNonNull(new GraphQLList(
    new GraphQLNonNull(require('../user-token'))
  )),
  resolve: async ({id}, args, {db, userToken}) =>
    !userToken || userToken.userId !== id ? [] :
    hasPermission('READ_USER_TOKENS', userToken.roles) ?
      await db('userTokens').where({userId: id}) :
    [userToken]
};
