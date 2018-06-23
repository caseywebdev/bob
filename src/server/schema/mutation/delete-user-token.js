const {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const getDb = require('../../functions/get-db');
const hasPermission = require('../../functions/has-permission');
const {WRITE_USER_TOKEN} = require('../../constants/roles');

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
    if (!userToken) throw new Error('Authentication required');

    if (!hasPermission(userToken.roles, WRITE_USER_TOKEN)) {
      throw new Error('The `WRITE_USER_TOKEN` role is required');
    }

    const db = await getDb();
    const {userId} = userToken;
    const target =
      self ? userToken :
      id ? await db('userTokens').where({id, userId}).first() :
      null;

    if (!target) return false;

    await db('userTokens').delete().where({id: target.id});

    return true;
  }
};
