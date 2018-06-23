const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const {WRITE_USER_TOKEN} = require('../../constants/roles');
const createUserToken = require('../../functions/create-user-token');
const getIpAddress = require('../../functions/get-ip-address');
const hasPermission = require('../../functions/has-permission');

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'CreateUserTokenInput',
        fields: () => ({
          name: {type: new GraphQLNonNull(GraphQLString)},
          roles: {type: new GraphQLNonNull(require('../roles'))}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'CreateUserTokenOutput',
    fields: () => ({
      userToken: {type: new GraphQLNonNull(require('../user-token'))}
    })
  })),
  resolve: async (
    obj,
    {input: {name, roles}},
    {req, req: {headers: {'user-agent': userAgent}}, userToken}
  ) => {
    if (
      !userToken ||
      !hasPermission(userToken.roles, WRITE_USER_TOKEN | roles)
    ) {
      throw new Error("You don't have sufficient permission to create a token");
    }

    return {
      userToken: await createUserToken({
        ipAddress: getIpAddress({req}),
        name,
        roles,
        userAgent,
        userId: userToken.userId
      })
    };
  }
};
