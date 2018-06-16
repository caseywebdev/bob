const {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const getDb = require('../../functions/get-db');
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
          id: {type: GraphQLString},
          self: {type: GraphQLBoolean}
        })
      }))
    }
  },
  type: new GraphQLNonNull(GraphQLBoolean),
  resolve: async (obj, {input: {id, self}}, {userToken}) => {
    if (!userToken) throw UNAUTHORIZED;

    if (!hasPermission(WRITE_USER_TOKEN, userToken.roles)) throw FORBIDDEN;

    const db = await getDb();
    const {userId} = userToken;
    const target =
      self ? userToken :
      id ? await db('userTokens').where({id, userId}).first() :
      null;
    if (!target) throw NOT_FOUND;

    await db('userTokens').delete().where({id: target.id});

    return {userToken: target};
  }
};
