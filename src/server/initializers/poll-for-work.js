const {PENDING, CLAIMED} = require('../../shared/constants/statuses');
const getDb = require('../functions/get-db');
const publishBuild = require('../functions/publish-build');
const runBuild = require('../functions/run-build');

const getBuild = async () => {
  const db = await getDb();
  const [build] = await db('builds')
    .update({status: CLAIMED, updatedAt: new Date()})
    .whereIn('id', sql => sql
      .select('id')
      .from('builds')
      .where({status: PENDING})
      .andWhereRaw("(meta ->> 'isPublished')::boolean")
      .orderBy('id', 'asc')
      .limit(1)
    )
    .returning('*');
  return build;
};

let sigtermReceived;
let timeoutId;
const maybeBuild = async () => {
  try {
    const build = await getBuild();
    if (build) {
      await publishBuild({build});
      runBuild({buildId: build.id});
    }
  } catch (er) {
    console.error(er);
  }
  if (!sigtermReceived) timeoutId = setTimeout(maybeBuild, 1000);
};

process.once('SIGTERM', () => {
  sigtermReceived = true;
  clearTimeout(timeoutId);
  console.log('Build polling stopped');
});

module.exports = () => {
  console.log('Polling for new builds...');
  maybeBuild();
};
