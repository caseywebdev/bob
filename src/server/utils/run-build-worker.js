const _ = require('underscore');
const {BUILDING, CANCELLED, CLAIMED, FAILED, PULLING, PUSHING, SUCCEEDED} = require('../../shared/constants/statuses');
const {promisify} = require('util');
const Docker = require('dockerode');
const getBuildArgs = require('./get-build-args');
const getDb = require('./get-db');
const getEnv = require('./get-env');
const getRegistryConfig = require('./get-registry-config');
const LogLineStream = require('./log-line-stream');
const publishBuild = require('./publish-build');
const sources = require('../sources');
const updateBuildStatus = require('./update-build-status');
const uuid = require('uuid/v4');

const docker = new Docker();
const call = (obj, key, ...args) => promisify(obj[key].bind(obj))(...args);

const handleStream = ({logLines, stream}) =>
  new Promise((resolve, reject) =>
    docker.modem.followProgress(
      stream,
      er => er ? reject(er) : resolve(),
      logLine => logLines.write(logLine)
    )
  );

const getAuthConfig = async ({env, tag}) => {
  let host = tag.split('/').slice(-3, -2)[0];
  if (!host) host = 'https://index.docker.io/v1/';
  return (await getRegistryConfig({env}))[host];
};

const pullImage = async ({env, logLines, tag}) => {
  const authconfig = await getAuthConfig({env, tag});
  const stream = await call(docker, 'pull', tag, {authconfig});
  await handleStream({logLines, stream});
};

const pullImages = async ({build: {tags}, logLines, env}) => {
  for (let tag of tags) {
    try { await pullImage({env, logLines, tag}); } catch (er) {}
  }
};

const buildImage = async ({build, env, logLines, source}) => {
  const t = `tmp:${uuid()}`;
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
  await handleStream({logLines, stream});
  return Promise.all(_.map(tags, fullTag => {
    const [repo, tag] = fullTag.split(':');
    return call(docker.getImage(t), 'tag', {repo, tag});
  }));
};

const pushImage = async ({env, tag, logLines}) => {
  const authconfig = await getAuthConfig({env, tag});
  const stream = await call(docker.getImage(tag), 'push', {authconfig});
  await handleStream({logLines, stream});
};

const pushImages = async ({build, env, logLines}) => {
  for (let tag of build.tags) await pushImage({env, logLines, tag});
};

module.exports = async ({buildId}) => {
  const update = ({error, status, unless}) =>
    updateBuildStatus({
      buildId,
      error,
      status,
      unless: unless || [CANCELLED],
      onConflict: () => process.exit()
    });
  try {
    const db = await getDb();
    const [build] = await db('builds').select().where({id: buildId});
    if (build.status !== CLAIMED) return process.exit(0);

    await publishBuild({build});
    const {envId, id, sourceId} = build;
    const env = await getEnv({id: envId});
    const source = sources[sourceId];
    const logLines = new LogLineStream({buildId: id});
    await update({status: PULLING});
    await pullImages({build, env, logLines});

    await update({status: BUILDING});
    await buildImage({build, env, logLines, source});

    await update({status: PUSHING});
    await pushImages({build, env, logLines});

    await new Promise(resolve => logLines.end(resolve));
    await update({status: SUCCEEDED, unless: []});
  } catch (er) {
    const error = `${er}`;
    await update({error, status: FAILED});
  }
};
