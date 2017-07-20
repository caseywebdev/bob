const getDb = require('./get-db');
const publishBuild = require('./publish-build');

module.exports = async ({buildId, error, status, unless, onConflict}) => {
  const db = await getDb();
  const [build] = await db('builds')
    .update({status, error, updatedAt: new Date()})
    .where({id: buildId})
    .whereNotIn('status', unless || [])
    .returning('*');
  return build ? publishBuild({build}) : onConflict && onConflict();
};
