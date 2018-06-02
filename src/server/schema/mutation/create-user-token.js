const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const {WRITE_USER_TOKEN} = require('../../../shared/functions/has-permission');
const createUserToken = require('../../functions/create-user-token');
const getIpAddress = require('../../functions/get-ip-address');
const hasPermission = require('../../../shared/functions/has-permission');

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
      !hasPermission(WRITE_USER_TOKEN | roles, userToken.roles)
    ) throw new Error('Forbidden');

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
