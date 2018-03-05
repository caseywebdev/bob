const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const bcrypt = require('bcrypt');
const config = require('../../config');
const createRandomToken = require('../../functions/create-random-token');
const mail = require('../../functions/mail');
const uuid = require('uuid/v4');

const {bob: {url}, passwordSaltRounds} = config;

module.exports = {
  args: {
    input: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'SignUpInput',
        fields: () => ({
          emailAddress: {type: new GraphQLNonNull(require('../email-address-string'))},
          name: {type: new GraphQLNonNull(GraphQLString)},
          password: {type: new GraphQLNonNull(GraphQLString)}
        })
      }))
    }
  },
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'SignUpOutput',
    fields: () => ({
      user: {type: new GraphQLNonNull(require('../user'))}
    })
  })),
  resolve: async (obj, {input: {emailAddress, name, password}}, {db}) => {
    const existing = await db('emailAddresses')
      .where({emailAddress})
      .whereNotNull('verifiedAt')
      .first();
    if (existing) {
      throw new Error(
        'That email address has already been signed up. ' +
        'Did you mean to sign in?'
      );
    }

    const emailAddressId = uuid();
    let user;
    const passwordHash = await bcrypt.hash(password, passwordSaltRounds);
    const {token, tokenHash} = await createRandomToken();
    await db.transaction(async trx => {
      user = (
        await trx('users')
          .insert({id: uuid(), name, passwordHash})
          .returning('*')
      )[0];
      await trx('emailAddresses')
        .insert({
          id: emailAddressId,
          userId: user.id,
          emailAddress,
          tokenHash
        });
    });

    await mail({
      to: {name, address: emailAddress},
      subject: 'Please verify your Bob email address',
      markdown: `Verify URL: ${url}/email-addresses/${emailAddressId}/verify/${token}`
    });

    return {user};
  }
};
