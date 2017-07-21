const {PENDING, CLAIMED} = require('../../shared/constants/statuses');
const getDb = require('../utils/get-db');
const runBuild = require('../utils/run-build');

let timeoutId;

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
  try {
    const build = await getBuild();
    if (build) runBuild({buildId: build.id});
  } catch (er) {
    console.error(er);
  }
  timeoutId = setTimeout(maybeBuild, 1000);
};

process.on('SIGTERM', () => {
  clearTimeout(timeoutId);
  console.log('Build polling stopped');
});

module.exports = () => {
  console.log('Polling for new builds...');
  maybeBuild();
};
