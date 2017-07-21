const getDb = require('./get-db');
const getRootUserId = require('./get-root-user-id');

module.exports = async ({envId, level, userId}) => {
  if (userId === await getRootUserId()) return true;

  const db = await getDb();
  const [row] = await db('permissions')
    .select()
    .where({envId, userId})
    .whereIn('userId', [userId, 'public'])
    .andWhere('bit_and(level, ?) > 0', [level]);
  return !!row;
};
