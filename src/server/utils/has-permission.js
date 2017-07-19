const getDb = require('./get-db');
const getRootToken = require('./get-root-token');
const splitAuth = require('./split-auth');

module.exports = async ({auth, envId, level}) => {
  const [type, id] = splitAuth({auth});
  if (type === 'token' && id === await getRootToken()) return true;

  const db = await getDb();
  const [row] = await db('permissions')
    .select()
    .where({auth, envId})
    .whereIn('auth', [auth, 'public'])
    .andWhere('bit_and(level, ?) > 0', level);
  return !!row;
};
