const {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString
} = require('graphql');
const verifyEmailAddressClaim = require('../../functions/verify-email-address-claim');
const pubsub = require('../../constants/pubsub');

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
  type: new GraphQLNonNull(GraphQLBoolean),
  resolve: async (obj, {input: {token}}) => {
    const {id} = await verifyEmailAddressClaim({token});

    await pubsub.publish(`emailAddressClaim:${id}:verified`, {
      emailAddressClaimVerified: true
    });

    return true;
  }
};
