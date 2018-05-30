const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const verifyEmailAddressClaim = require('../../functions/verify-email-address-claim');

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'VerifyEmailAddressClaimInput',
        fields: () => ({
          token: {type: new GraphQLNonNull(GraphQLString)}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'VerifyEmailAddressClaimOutput',
    fields: () => ({
      emailAddress: {type: new GraphQLNonNull(require('../email-address'))}
    })
  })),
  resolve: async (obj, {input: {token}}) => {
    const {emailAddress} = await verifyEmailAddressClaim({token});
    return {emailAddress};
  }
};
