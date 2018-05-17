const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const getDb = require('../../functions/get-db');
const verifyEmailAddress = require('../../functions/verify-email-address');

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'VerifyEmailAddressInput',
        fields: () => ({
          token: {type: new GraphQLNonNull(GraphQLString)}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'VerifyEmailAddressOutput',
    fields: () => ({
      userEmailAddress: {
        type: new GraphQLNonNull(require('../user-email-address'))
      }
    })
  })),
  resolve: async (obj, {input: {token}}, {userToken}) => {
    if (!userToken) throw new Error('Authentication required');

    const uea = await verifyEmailAddress({token});
    const db = await getDb();
    return {
      userEmailAddress: (
        await db('userEmailAddresses')
          .update({updatedAt: new Date(), userId: userToken.userId})
          .where({id: uea.id})
          .returning('*')
      )[0]
    };
  }
};
