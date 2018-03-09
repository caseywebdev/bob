module.exports = {
  type: require('../user'),
  resolve: async ({userId}, args, {loaders: {users}}) =>
    userId && await users.load(userId)
};
