const {FORBIDDEN, UNAUTHORIZED} = require('../../../shared/constants/errors');
const {GraphQLObjectType, GraphQLNonNull} = require('graphql');
const hasPermission = require('../../../shared/functions/has-permission');
const {WRITE_USER_TOKEN} = require('../../../shared/constants/roles');

module.exports = {
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'SignOutOutput',
    fields: () => ({
      userToken: {type: new GraphQLNonNull(require('../user-token'))}
    })
  })),
  resolve: async (obj, args, {db, userToken}) => {
    if (!userToken) throw UNAUTHORIZED;

    if (!hasPermission(WRITE_USER_TOKEN, userToken.roles)) throw FORBIDDEN;

    await db('userTokens').delete().where({id: userToken.id});

    return {userToken};
  }
};
