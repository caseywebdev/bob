const {
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLNonNull
} = require('graphql');
const config = require('../../config');
const createToken = require('../../functions/create-token');
const getDb = require('../../functions/get-db');
const mail = require('../../functions/mail');
const ua = require('useragent');

const {url} = config.bob;

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'CreateEmailAddressClaimInput',
        fields: () => ({
          emailAddress: {type: new GraphQLNonNull(require('../email-address'))}
        })
      }))
    }
  },
  type: GraphQLBoolean,
  resolve: async (
    obj,
    {input: {emailAddress}},
    {req: {headers: {'user-agent': userAgent}, ip: ipAddress}, userToken}
  ) => {
    const {id, token, tokenHash, tokenHashAlgorithm} = await createToken();
    const db = await getDb();
    await db('emailAddressClaims')
      .insert({
        emailAddress,
        id,
        ipAddress,
        tokenHash,
        tokenHashAlgorithm,
        userAgent,
        userId: userToken && userToken.userId
      });

    await mail({
      to: {address: emailAddress},
      subject: 'Please verify your Bob email address',
      markdown:
        `From: ${ua.parse(userAgent)}\n (${ipAddress})` +
        `Verify URL: ${url}/verify-email-address-claim?token=${token}`
    });

    return true;
  }
};
