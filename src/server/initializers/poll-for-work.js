const {PENDING, CLAIMED} = require('../../shared/constants/statuses');
const getDb = require('../utils/get-db');
const ensure = require('../utils/ensure');
const loop = require('../utils/loop');
const runBuild = require('../utils/run-build');
const sleep = require('../utils/sleep');

const getBuild = async () => {
  const db = await getDb();
  const [build] = await db('builds')
    .update({status: CLAIMED, updatedAt: new Date()})
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
  if (build) runBuild({buildId: build.id});
  await sleep(1000);
};

module.exports = async () => { loop(() => ensure(maybeBuild)); };
