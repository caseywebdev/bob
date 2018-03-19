const {GraphQLNonNull, GraphQLString} = require('graphql');
const verifyEmailAddress = require('../../functions/verify-email-address');

module.exports = {
  args: {token: {type: new GraphQLNonNull(GraphQLString)}},
  type: new GraphQLNonNull(require('../user-email-address')),
  resolve: async (obj, {token}, {db}) => await verifyEmailAddress({db, token})
};
