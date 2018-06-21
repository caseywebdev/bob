const {GraphQLList, GraphQLNonNull} = require('graphql');

module.exports = {
  type: new GraphQLNonNull(new GraphQLList(
    new GraphQLNonNull(require('../user-email-address'))
  )),
  resolve: async ({id}, args, {loaders, userToken}) =>
    !userToken || userToken.userId !== id ? [] :
    loaders.userEmailAddressesByUser.load(id)
};
