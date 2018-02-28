const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const bcrypt = require('bcrypt');
const getDb = require('../../functions/get-db');
const createToken = require('../../functions/create-token');
const createTokenHash = require('../../functions/create-token-hash');

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'SignInInput',
        fields: () => ({
          emailAddress: {type: new GraphQLNonNull(require('../email-address-string'))},
          password: {type: new GraphQLNonNull(GraphQLString)}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'SignInOutput',
    fields: () => ({
      token: {type: new GraphQLNonNull(GraphQLString)},
      user: {type: new GraphQLNonNull(require('../user'))}
    })
  })),
  resolve: async (obj, {input: {emailAddress, password}}) => {
    const db = await getDb();
    const user = await db('users')
      .innerJoin('emailAddresses', 'users.id', 'emailAddresses.userId')
      .where({emailAddress})
      .first();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new Error('Invalid email address and password combination');
    }

    const token = await createToken();
    const tokenHash = await createTokenHash({token});
    const [{id: tokenId}] = await db('tokens')
      .insert({tokenHash, userId: user.id})
      .returning('*');
    return {token: `${tokenId}-${token}`, user};
  }
};
