const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const bcrypt = require('bcrypt');

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'VerifyEmailAddressInput',
        fields: () => ({
          emailAddressId: {type: new GraphQLNonNull(require('../uuid'))},
          token: {type: new GraphQLNonNull(GraphQLString)}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'VerifyEmailAddressOutput',
    fields: () => ({
      emailAddress: {type: new GraphQLNonNull(require('../email-address'))}
    })
  })),
  resolve: async (obj, {input: {emailAddressId, token}}, {db}) => {
    let emailAddress = await db('emailAddresses')
      .where({id: emailAddressId, userId: null})
      .first();
    if (
      !emailAddress ||
      !(await bcrypt.compare(token, emailAddress.tokenHash))
    ) throw new Error('Invalid emailAddressId and token combination');

    emailAddress = (
      await db('emailAddresses')
        .update({verifiedAt: new Date()})
        .where({id: emailAddress.id})
        .returning('*')
    )[0];

    return {emailAddress};
  }
};
