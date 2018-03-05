const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull
} = require('graphql');
const config = require('../../config');
const createRandomToken = require('../../functions/create-random-token');
const mail = require('../../functions/mail');
const uuid = require('uuid/v4');
const qs = require('querystring');

const {bob: {url}} = config;

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'SignUpInput',
        fields: () => ({
          emailAddress: {type: new GraphQLNonNull(require('../email-address-string'))}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'SignUpOutput',
    fields: () => ({
      emailAddress: {type: new GraphQLNonNull(require('../email-address'))}
    })
  })),
  resolve: async (obj, {input: {emailAddress}}, {db}) => {
    let record = await db('emailAddresses').where({emailAddress}).first();
    if (record && record.userId) {
      throw new Error(
        'That email address has already been signed up. ' +
        'Did you mean to sign in?'
      );
    }

    const {token, tokenHash} = await createRandomToken();
    if (record) {
      record = (
        await db('emailAddresses')
          .update({tokenHash, updatedAt: new Date()})
          .where({id: record.id})
          .returning('*')
        )[0];
    } else {
      record = (
        await db('emailAddresses')
          .insert({id: uuid(), emailAddress, tokenHash})
          .returning('*')
      )[0];
    }

    await mail({
      to: {address: emailAddress},
      subject: 'Please verify your Bob email address',
      markdown: `Verify URL: ${url}/sign-up?` +
        qs.stringify({emailAddressId: record.id, token})
    });

    return {emailAddress: record};
  }
};
