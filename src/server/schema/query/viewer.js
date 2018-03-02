const User = require('../user');

module.exports = {
  type: User,
  resolve: async (__, ___, {loaders: {users}, token}) => {
    if (!token) throw new Error('Authentication required');

    return await users.load(token.userId);
  }
};
