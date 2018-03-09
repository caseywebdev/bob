const {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const createUserToken = require('../../functions/create-user-token');

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'CreateUserTokenInput',
        fields: () => ({
          name: {type: new GraphQLNonNull(GraphQLString)},
          roles: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(require('../role'))))}
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
  resolve: async (obj, {input: {name, roles}}, {db, req, userToken}) => {
    if (!userToken || userToken.roles > 0) throw new Error('Forbidden');

    if (!roles.length) throw new Error('At least one role is required');

    return {
      userToken: await createUserToken({
        db,
        name,
        req,
        roles,
        userId: userToken.userId
      })
    };
  }
};
