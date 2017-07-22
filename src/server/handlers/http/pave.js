const {Store} = require('pave');
const router = require('../../routes');

module.exports = async ({req: {body: {auth, query}}, res}) => {
  const store = new Store({router});
  await store.run({query: ['signIn!', auth]});
  res.send(await store.run({force: true, query}));
};
