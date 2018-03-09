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
  resolve: async (obj, {input: {emailAddress}}, {db}) => {
    if (
      await db('userEmailAddresses')
        .where({emailAddress})
        .whereNotNull('userId')
        .first()
    ) throw new Error(`${emailAddress} has already been claimed.`);

    const id = uuid();
    const {token, tokenHash} = await createToken({id});
    const {rows: {0: uea}} = await db.raw(`
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
    ]);

    await mail({
      to: {address: emailAddress},
      subject: 'Please verify your Bob email address',
      markdown: `Verify URL: ${url}/verify-email-address?token=${token}`
    });

    return {userEmailAddress: uea};
  }
};
