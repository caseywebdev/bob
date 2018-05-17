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
const uuid = require('uuid/v4');

const {bob: {url}} = config;

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
    {
      loaders,
      req: {headers: {'user-agent': userAgent}, ip: ipAddress},
      userToken
    }
  ) => {
    const id = uuid();
    const {token, tokenHash, tokenHashAlgorithm} = await createToken({id});
    const db = await getDb();
    await db('emailAddressClaims')
      .insert({
        id,
        emailAddress,
        tokenHash,
        tokenHashAlgorithm,
        userAgent,
        ipAddress
      });

    let path = '/sign-up';
    if (userToken) {
      const {name} = await loaders.users.load(userToken.userId);
      path = '/verify-email-address';
    }

    await mail({
      to: {address: emailAddress},
      subject: 'Please verify your Bob email address',
      markdown:
        `From: ${ua.parse(userAgent)}\n (${ipAddress})` +
        `Verify URL: ${url}${path}?token=${token}`
    });

    return true;
  }
};
