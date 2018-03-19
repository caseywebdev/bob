const {GraphQLNonNull} = require('graphql');

module.exports = {
  type: new GraphQLNonNull(require('../user')),
  resolve: async ({userId}, args, {loaders: {users}}) =>
    await users.load(userId)
};
