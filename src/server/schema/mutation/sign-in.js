const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const {passwordSaltRounds} = require('../../config');
const createUserToken = require('../../functions/create-user-token');
const getDb = require('../../functions/get-db');

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'SignInInput',
        fields: () => ({
          token: {type: new GraphQLNonNull(GraphQLString)}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'SignInOutput',
    fields: () => ({
      userToken: {type: new GraphQLNonNull(require('../user-token'))}
    })
  })),
  resolve: async (
    obj,
    {input: {emailAddress, password}},
    {req: {headers: {'user-agent': userAgent}, ip: ipAddress}}
  ) => {
    const db = await getDb();
    const user = await db('users')
      .select('users.*')
      .innerJoin('userEmailAddresses', 'users.id', 'userEmailAddresses.userId')
      .where({emailAddress})
      .first();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new Error('Invalid email address and password combination');
    }

    if (bcrypt.getRounds(user.passwordHash) !== passwordSaltRounds) {
      await db('users')
        .update({
          passwordHash: await bcrypt.hash(password, passwordSaltRounds),
          updatedAt: new Date()
        })
        .where({id: user.id});
    }

    return {
      userToken: await createUserToken({
        ipAddress,
        roles: 0,
        userAgent,
        userId: user.id
      })
    };
  }
};
