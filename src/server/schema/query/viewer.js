const User = require('../user');

module.exports = {
  type: User,
  resolve: async (obj, args, {loaders: {users}, userToken}) => {
    if (!userToken) throw new Error('Authentication required');

    return await users.load(userToken.userId);
  }
};
