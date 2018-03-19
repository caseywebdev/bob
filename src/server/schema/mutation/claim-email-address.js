const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull
} = require('graphql');
const config = require('../../config');
const createToken = require('../../functions/create-token');
const mail = require('../../functions/mail');
const uuid = require('uuid/v4');

const {bob: {url}} = config;

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'ClaimEmailAddressInput',
        fields: () => ({
          emailAddress: {type: new GraphQLNonNull(require('../email-address'))}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'ClaimEmailAddressOutput',
    fields: () => ({
      userEmailAddress: {type: new GraphQLNonNull(require('../user-email-address'))}
    })
  })),
  resolve: async (obj, {input: {emailAddress}}, {db, loaders, userToken}) => {
    let uea = await db('userEmailAddresses').where({emailAddress}).first();
    if (uea && uea.userId) {
      throw new Error(`${emailAddress} has already been claimed.`);
    }

    const id = uea ? uea.id : uuid();
    const {token, tokenHash} = await createToken({id});
    uea = (await db.raw(`
      INSERT INTO "userEmailAddresses"
        ("id", "emailAddress", "tokenHash") VALUES (?, ?, ?)
      ON CONFLICT ("emailAddress") DO UPDATE
        SET "tokenHash" = ?, "updatedAt" = ?
      RETURNING *
    `, [
      id,
      emailAddress,
      tokenHash,
      tokenHash,
      new Date()
    ])).rows[0];

    const to = {address: emailAddress};
    let path = '/sign-up';
    if (userToken) {
      const {name} = await loaders.users.load(userToken.userId);
      to.name = name;
      path = '/verify-email-address';
    }

    await mail({
      to,
      subject: 'Please verify your Bob email address',
      markdown: `Verify URL: ${url}${path}?token=${token}`
    });

    return {userEmailAddress: uea};
  }
};
