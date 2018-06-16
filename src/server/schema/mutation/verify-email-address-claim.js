const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const createUserToken = require('../../functions/create-user-token');
const getDb = require('../../functions/get-db');
const getIpAddress = require('../../functions/get-ip-address');
const uuid = require('uuid/v4');
const verifyEmailAddressClaim = require('../../functions/verify-email-address-claim');

module.exports = {
  description: 'Verify an email address claim. If the user is authenticated, the email address will be added to their account.',
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
  type: new GraphQLNonNull(new GraphQLObjectType({
    name: 'VerifyEmailAddressClaimOutput',
    fields: () => ({
      token: {type: GraphQLString}
    })
  })),
  resolve: async (
    obj,
    {input: {token}},
    {loaders, req, req: {headers: {'user-agent': userAgent}}, userToken}
  ) => {
    const {emailAddress} = await verifyEmailAddressClaim({token});

    if (userToken) {
      // TODO: Handle the "add to account" case.
      return {};
    }

    const db = await getDb();
    let user = await db('users')
      .select('users.*')
      .innerJoin('userEmailAddresses', 'users.id', 'userEmailAddresses.userId')
      .where({emailAddress})
      .first();

    if (!user) {
      const userId = uuid();
      const name = emailAddress.slice(0, emailAddress.lastIndexOf('@'));
      const db = await getDb();
      await db.transaction(async trx => {
        user = (
          await trx('users').insert({id: userId, name}).returning('*')
        )[0];
        await trx('userEmailAddresses')
          .insert({emailAddress, id: uuid(), userId});
      });
    }

    loaders.users.clear(user.id).prime(user.id, user);

    userToken = await createUserToken({
      ipAddress: getIpAddress({req}),
      roles: [],
      userAgent,
      userId: user.id
    });

    return {token: userToken.token};
  }
};
