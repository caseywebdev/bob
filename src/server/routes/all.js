const getUser = require('../utils/get-user');

module.exports = {
  'auth!.$obj': async ({1: auth, store: {cache: {socket}}}) => ({
    user: {$set: socket.user = await getUser({auth})}
  })
};
