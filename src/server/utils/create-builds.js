const _ = require('underscore');
const createBuild = require('./create-build');
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
  return Promise.all(_.map(configs, config => {
    const {buildArgs, context, dockerfile, tags, meta} = config;
    return createBuild({
      buildArgs,
      context,
      dockerfile,
      envId,
      meta,
      ref,
      repo,
      sha,
      sourceId,
      tags: getTags({ref, sha, tags})
    });
  }));
};
