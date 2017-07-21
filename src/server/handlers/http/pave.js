const {Store} = require('pave');
const getUser = require('../../utils/get-user');
const router = require('../../routes');

module.exports = async ({body: query, query: {auth}}, res) => {
  const store = new Store({cache: {user: await getUser({auth})}, router});
  res.send(await store.run({query}));
};
