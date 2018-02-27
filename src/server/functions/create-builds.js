const _ = require('underscore');
const createBuild = require('./create-build');

const getTags = ({ref, hash, tags}) => {
  const variables = {REF: ref, HASH: hash};
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
  commit: {ref, repo, hash},
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
      hash,
      sourceId,
      tags: getTags({ref, hash, tags})
    });
  }));
};
