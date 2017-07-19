const _ = require('underscore');
const {FAILED, SUCCEEDED} = require('../constants/statuses');
const {promisify} = require('util');
const Docker = require('dockerode');
const getBuildArgs = require('./get-build-args');
const getDb = require('./get-db');
const getEnv = require('./get-env');
const getRegistryConfig = require('./get-registry-config');
const publishBuild = require('./publish-build');
const sources = require('../sources');
const uuid = require('uuid/v4');

const docker = new Docker();
const call = (obj, key, ...args) => promisify(obj[key].bind(obj))(...args);

const handleStream = stream =>
  new Promise((resolve, reject) =>
    docker.modem.followProgress(
      stream,
      er => er ? reject(er) : resolve(),
      ({stream}) => process.stdout.write(stream || '')
    )
  );

const getAuthConfig = async ({env, tag}) => {
  let host = tag.split('/').slice(-3, -2)[0];
  if (!host) host = 'https://index.docker.io/v1/';
  return (await getRegistryConfig({env}))[host];
};

const pullImage = async ({env, tag}) => {
  const authconfig = await getAuthConfig({env, tag});
  const stream = await call(docker, 'pull', tag, {authconfig});
  await handleStream(stream);
};

const pullImages = async ({build: {tags}, env}) => {
  for (let tag of tags) try { await pullImage({env, tag}); } catch (er) {}
};

const buildImage = async ({build, env, source}) => {
  const t = uuid();
  const {dockerfile, tags} = build;
  const buildArgs = getBuildArgs({build, env});
  const registryConfig = getRegistryConfig({env});
  const tarStream = source.getTarStream({build, env});
  const stream = await call(docker, 'buildImage', await tarStream, {
    buildargs: await buildArgs,
    cachefrom: tags,
    dockerfile,
    registryconfig: await registryConfig,
    t
  });
  await handleStream(stream);
  return Promise.all(_.map(tags, fullTag => {
    const [repo, tag] = fullTag.split(':');
    return call(docker.getImage(t), 'tag', {repo, tag});
  }));
};

const pushImage = async ({env, tag}) => {
  const authconfig = await getAuthConfig({env, tag});
  const stream = await call(docker.getImage(tag), 'push', {authconfig});
  await handleStream(stream);
};

const pushImages = async ({build, env}) => {
  for (let tag of build.tags) await pushImage({env, tag});
};

const updateStatus = async ({build, build: {id}, error, status}) => {
  const db = await getDb();
  build = await db('builds')
    .update({status, error, updatedAt: new Date()})
    .where({id})
    .returning('*');
  return publishBuild({build});
};

module.exports = async ({build}) => {
  try {
    await publishBuild({build});
    const {envId, sourceId} = build;
    const env = await getEnv({id: envId});
    const source = sources[sourceId];
    await pullImages({build, env});
    await buildImage({build, env, source});
    await pushImages({build, env});
    await updateStatus({build, status: SUCCEEDED});
  } catch (er) {
    try {
      await updateStatus({build, error: er.message, status: FAILED});
    } catch (er) {
      console.error(er);
    }
  }
};
