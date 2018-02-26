const {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'SignInInput',
        fields: () => ({
          email: {type: new GraphQLNonNull(require('../email-address'))},
          password: {type: new GraphQLNonNull(GraphQLString)}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'SignInOutput',
    fields: () => ({
      token: {type: new GraphQLNonNull(GraphQLString)},
      userId: {type: new GraphQLNonNull(GraphQLID)}
    })
  })),
  resolve: async (obj, {input: {email, password}}) => {
    if (!email || !password) throw new Error('email and password are required');
    return {token: `token-for-${email}`, userId: `nope-for-${password}`};
  }
};
