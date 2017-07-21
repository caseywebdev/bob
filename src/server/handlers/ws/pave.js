const {Store} = require('pave');
const router = require('../../routes');

module.exports = async ({socket, params: {query}}) =>
  (new Store({cache: {auth: socket.auth, socket}, router})).run({query});
