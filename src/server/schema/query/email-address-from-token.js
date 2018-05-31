const {GraphQLNonNull, GraphQLString} = require('graphql');
const verifyEmailAddressClaim = require('../../functions/verify-email-address-claim');

module.exports = {
  args: {token: {type: new GraphQLNonNull(GraphQLString)}},
  type: new GraphQLNonNull(require('../email-address')),
  resolve: async (obj, {token}) =>
    (await verifyEmailAddressClaim({token})).emailAddress
};
