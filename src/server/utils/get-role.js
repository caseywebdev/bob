const getDb = require('./get-db');
const getRootUserId = require('./get-root-user-id');
const {ADMIN, NONE} = require('../../shared/constants/permission-roles');

module.exports = async ({envId, userId}) => {
  if (userId === await getRootUserId()) return ADMIN;

  const db = await getDb();
  const [{role} = {role: NONE}] = await db('permissions')
    .where({envId, userId})
    .whereIn('userId', [userId, 'public'])
    .orderBy('role', 'desc')
    .limit(1);
  return role;
};
