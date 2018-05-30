const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const getDb = require('../../functions/get-db');
const uuid = require('uuid/v4');

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'SignUpInput',
        fields: () => ({
          name: {type: new GraphQLNonNull(GraphQLString)},
          token: {type: new GraphQLNonNull(GraphQLString)}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'SignUpOutput',
    fields: () => ({
      user: {type: new GraphQLNonNull(require('../user'))}
    })
  })),
  resolve: async (obj, {input: {name, password, token}}) => {
    const uea = await verifyEmailAddress({token});
    const userId = uuid();
    let user;
    const passwordHash = await bcrypt.hash(password, passwordSaltRounds);
    const db = await getDb();
    await db.transaction(async trx => {
      user = (
        await trx('users')
          .insert({id: userId, name, passwordHash})
          .returning('*')
      )[0];
      await trx('userEmailAddresses')
        .update({updatedAt: new Date(), userId})
        .where({id: uea.id});
    });

    return {user};
  }
};
