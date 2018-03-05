const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const bcrypt = require('bcrypt');
const config = require('../../config');
const mail = require('../../functions/mail');
const uuid = require('uuid/v4');

const {passwordSaltRounds} = config;

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
    const existing = await db('emailAddresses').where({emailAddress}).first();
    if (existing) {
      throw new Error(
        'That email address has already been signed up. ' +
        'Did you mean to sign in?'
      );
    }

    let user;
    const passwordHash = await bcrypt.hash(password, passwordSaltRounds);
    await db.transaction(async trx => {
      user = (
        await trx('users')
          .insert({id: uuid(), name, passwordHash})
          .returning('*')
      )[0];
      await trx('emailAddresses')
        .insert({id: uuid(), userId: user.id, emailAddress});
    });

    await mail({
      to: {name, address: emailAddress},
      subject: 'Please verify your Bob email address',
      markdown: `Verify URL for ${JSON.stringify(user)}`
    });

    return {user};
  }
};
