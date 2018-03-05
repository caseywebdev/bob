const {GraphQLList, GraphQLNonNull} = require('graphql');

module.exports = {
  type: new GraphQLNonNull(new GraphQLList(
    new GraphQLNonNull(require('../email-address'))
  )),
  resolve: async ({id}, args, {db}) =>
    await db('emailAddresses').where({userId: id})
};
