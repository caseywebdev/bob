const {Store} = require('pave');
const router = require('../../routes');

module.exports = async ({socket, params: {auth, query}}) => {
  const {user} = socket;
  const store = new Store({cache: {socket, user}, router});
  let deltas = user ? [] : await store.run({query: ['signIn!', auth]});
  return deltas.concat(await store.run({force: true, query}));
};
