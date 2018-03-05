module.exports = {
  type: require('../user'),
  resolve: async ({userId}, args, {loaders: {users}}) =>
    await users.load(userId)
};
