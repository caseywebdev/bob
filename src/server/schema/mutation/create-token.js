const {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const createToken = require('../../functions/create-token');

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'CreateTokenInput',
        fields: () => ({
          name: {type: new GraphQLNonNull(GraphQLString)},
          roles: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(require('../role'))))}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'CreateTokenOutput',
    fields: () => ({
      token: {type: new GraphQLNonNull(require('../token'))}
    })
  })),
  resolve: async (obj, {input: {name, roles}}, {db, req, token}) => {
    if (!token || token.roles > 0) throw new Error('Forbidden');

    if (!roles.length) throw new Error('At least one role is required');

    return await createToken({db, name, req, roles, userId: token.userId});
  }
};
