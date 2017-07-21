const _ = require('underscore');
const getDb = require('./get-db');
const publishBuild = require('./publish-build');

const getTags = ({ref, sha, tags}) => {
  const variables = {REF: ref, SHA: sha};
  return _.unique(_.map(tags, str =>
    _.reduce(
      variables,
      (str, val, key) => str.replace(new RegExp(`{{${key}}}`, 'g'), val),
      str
    )
  ));
};

module.exports = async ({
  commit,
  commit: {ref, repo, sha},
  env,
  env: {id: envId},
  source,
  source: {id: sourceId}
}) => {
  const json = await source.readFile({commit, env, filename: 'bob.json'});
  if (!json) return [];

  let configs = JSON.parse(json);
  if (!_.isArray(configs)) configs = [configs];
  const db = await getDb();
  return Promise.all(_.map(configs, async config => {
    const {buildArgs, context, dockerfile, tags, meta} = config;
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
        tags: JSON.stringify(getTags({ref, sha, tags}))
      })
      .returning('*');
    await publishBuild({build});
    return build;
  }));
};
