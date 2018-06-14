const {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType
} = require('graphql');
const config = require('../../config');
const createToken = require('../../functions/create-token');
const getDb = require('../../functions/get-db');
const mail = require('../../functions/mail');
const getIpAddress = require('../../functions/get-ip-address');
const ua = require('useragent');
const qs = require('querystring');

const {clientUrl} = config.bob;

const PATHS = {
  CREATE_USER_EMAIL_ADDRESS: '/create-user-email-address',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up'
};

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'CreateEmailAddressClaimInput',
        fields: () => ({
          emailAddress: {type: new GraphQLNonNull(require('../email-address'))},
          intent: {type: new GraphQLNonNull(new GraphQLEnumType({
            name: 'CreateEmailAddressClaimInputIntent',
            values: {
              CREATE_USER_EMAIL_ADDRESS: {},
              SIGN_IN: {},
              SIGN_UP: {}
            }
          }))}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'CreateEmailAddressClaimOutput',
    fields: () => ({
      emailAddressClaimId: {type: new GraphQLNonNull(require('../uuid'))}
    })
  })),
  resolve: async (
    obj,
    {input: {emailAddress, intent}},
    {req, req: {headers: {'user-agent': userAgent}}, userToken}
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
        userAgent,
        userId: userToken && userToken.userId
      });

    await mail({
      to: {address: emailAddress},
      subject: 'Please verify your Bob email address',
      markdown:
        `From: ${ua.parse(userAgent)} (${ipAddress})\n\n` +
        `Verify URL: ${clientUrl}${PATHS[intent]}?${qs.stringify({token})}`
    });

    return {emailAddressClaimId: id};
  }
};
