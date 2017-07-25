const getDb = require('./get-db');
const publishBuild = require('./publish-build');

module.exports = async ({
  buildArgs,
  context,
  dockerfile,
  envId,
  meta,
  ref,
  repo,
  sha,
  sourceId,
  tags
}) => {
  const db = await getDb();
  const [build] = await db('builds')
    .insert({
      buildArgs,
      context,
      dockerfile,
      envId,
      meta,
      ref,
      repo,
      sha,
      sourceId,
      tags: JSON.stringify(tags)
    })
    .returning('*');
  await publishBuild({build});
  return build;
};
