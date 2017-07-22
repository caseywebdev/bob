const {Store} = require('pave');
const router = require('../../routes');

module.exports = async ({socket, params: {auth, query}}) => {
  const store = new Store({cache: {socket}, router});
  await store.run({query: ['signIn!', auth]});
  return store.run({force: true, query});
};
