const {Store} = require('pave');
const router = require('../../routes');
const setAuth = require('../../utils/set-auth');

module.exports = async ({socket, params: {auth, query}}) => {
  await setAuth({auth, socket});
  return (new Store({cache: {socket}, router})).run({query});
};
