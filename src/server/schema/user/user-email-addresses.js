const {GraphQLList, GraphQLNonNull} = require('graphql');

module.exports = {
  type: new GraphQLNonNull(new GraphQLList(
    new GraphQLNonNull(require('../user-email-address'))
  )),
  resolve: async ({id}, args, {db}) =>
    await db('userEmailAddresses').where({userId: id})
};
