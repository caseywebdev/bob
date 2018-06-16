const {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLBoolean
} = require('graphql');
const config = require('../../config');
const createToken = require('../../functions/create-token');
const getDb = require('../../functions/get-db');
const mail = require('../../functions/mail');
const getIpAddress = require('../../functions/get-ip-address');
const ua = require('useragent');
const qs = require('querystring');

const {clientUrl} = config.bob;

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
  type: new GraphQLNonNull(GraphQLBoolean),
  resolve: async (
    obj,
    {input: {emailAddress}},
    {req, req: {headers: {'user-agent': userAgent}}}
  ) => {
    const {id, token, tokenHash, tokenHashAlgorithm} = await createToken();
    const db = await getDb();
    const ipAddress = getIpAddress({req});
    await db('emailAddressClaims')
      .insert({
        emailAddress,
        id,
        ipAddress,
        tokenHash,
        tokenHashAlgorithm,
        userAgent
      });

    await mail({
      to: {address: emailAddress},
      subject: 'Please verify your Bob email address',
      markdown:
        `From: ${ua.parse(userAgent)} (${ipAddress})\n\n` +
        `Verify URL: ${clientUrl}/verify-email-address-claim?` +
        qs.stringify({token})
    });

    return true;
  }
};
