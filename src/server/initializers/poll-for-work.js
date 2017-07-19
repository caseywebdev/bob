const {PENDING, RUNNING} = require('../constants/statuses');
const getDb = require('../utils/get-db');
const loop = require('../utils/loop');
const runBuild = require('../utils/run-build');
const sleep = require('../utils/sleep');

const getBuild = async () => {
  const db = await getDb();
  const [build] = await db('builds')
    .update({status: RUNNING, updatedAt: new Date()})
    .whereIn('id', sql => sql
      .select('id')
      .from('builds')
      .where({status: PENDING})
      .orderBy('id', 'asc')
      .limit(1)
    )
    .returning('*');
  return build;
};

const maybeBuild = async () => {
  const build = await getBuild();
  if (build) runBuild({build});
  await sleep(1000);
};

module.exports = async () => { loop(maybeBuild); };
