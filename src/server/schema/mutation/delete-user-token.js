const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const hasPermission = require('../../../shared/functions/has-permission');
const {
  FORBIDDEN,
  NOT_FOUND,
  UNAUTHORIZED
} = require('../../../shared/constants/errors');
const {WRITE_USER_TOKEN} = require('../../../shared/constants/roles');

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'DeleteUserTokenInput',
        fields: () => ({
          userTokenId: {type: new GraphQLNonNull(GraphQLString)}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'DeleteUserTokenOutput',
    fields: () => ({
      userToken: {type: new GraphQLNonNull(require('../user-token'))}
    })
  })),
  resolve: async (obj, {input: {userTokenId}}, {db, userToken}) => {
    if (!userToken) throw UNAUTHORIZED;

    if (!hasPermission(WRITE_USER_TOKEN, userToken.roles)) throw FORBIDDEN;

    const target = await db('userTokens')
      .where({id: userTokenId, userId: userToken.userId})
      .first();
    if (!target) throw NOT_FOUND;

    await db('userTokens').delete().where({id: target.id});

    return {userToken: target};
  }
};
