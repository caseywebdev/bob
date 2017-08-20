const _ = require('underscore');
const {BUILDING, CANCELLED, FAILED, PULLING, PUSHING, SUCCEEDED} = require('../../shared/constants/statuses');
const {docker: {buildOptions}} = require('../config');
const {promisify} = require('util');
const getBuildArgs = require('./get-build-args');
const getDb = require('./get-db');
const getDocker = require('./get-docker');
const getEnv = require('./get-env');
const getRegistryConfig = require('./get-registry-config');
const OutputStream = require('./output-stream');
const sources = require('../sources');
const updateBuildStatus = require('./update-build-status');
const uuid = require('uuid/v4');

const call = (obj, key, ...args) => promisify(obj[key].bind(obj))(...args);

const handleStream = ({output, stream}) =>
  new Promise(async (resolve, reject) =>
    (await getDocker()).modem.followProgress(
      stream,
      er => er ? reject(er) : resolve(),
      chunk => output.write(chunk)
    )
  );

const getAuthConfig = async ({env, tag}) => {
  let host = tag.split('/').slice(-3, -2)[0];
  if (!host) host = 'https://index.docker.io/v1/';
  return (await getRegistryConfig({env}))[host];
};

const pullImage = async ({env, output, tag}) => {
  const authconfig = await getAuthConfig({env, tag});
  const docker = await getDocker();
  const stream = await call(docker, 'pull', tag, {authconfig});
  await handleStream({output, stream});
};

const pullImages = async ({build: {tags}, output, env}) => {
  for (let tag of tags) {
    try { await pullImage({env, output, tag}); } catch (er) {}
  }
};

const buildImage = async ({build, env, output, source}) => {
  const t = `tmp:${uuid()}`;
  const {dockerfile, tags} = build;
  const buildArgs = getBuildArgs({build, env});
  const registryConfig = getRegistryConfig({env});
  const tarStream = source.getTarStream({build, env});
  const docker = await getDocker();
  const stream = await call(docker, 'buildImage', await tarStream, _.extend(
    {},
    buildOptions,
    {
      buildargs: await buildArgs,
      cachefrom: tags,
      dockerfile,
      registryconfig: await registryConfig,
      t
    }
  ));
  await handleStream({output, stream});
  return Promise.all(_.map(tags, fullTag => {
    const [repo, tag] = fullTag.split(':');
    return call(docker.getImage(t), 'tag', {repo, tag});
  }));
};

const pushImage = async ({env, tag, output}) => {
  const authconfig = await getAuthConfig({env, tag});
  const docker = await getDocker();
  const stream = await call(docker.getImage(tag), 'push', {authconfig});
  await handleStream({output, stream});
};

const pushImages = async ({build, env, output}) => {
  for (let tag of build.tags) await pushImage({env, output, tag});
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

  let output;
  const endOutput = _.once(() => {
    if (output) return new Promise(resolve => output.end(resolve));
  });

  let error;
  try {
    const db = await getDb();
    const [build] = await db('builds').select().where({id: buildId});
    const {envId, id, sourceId} = build;
    const env = await getEnv({id: envId});
    const source = sources[sourceId];
    output = new OutputStream({buildId: id});
    await update({status: PULLING});
    await pullImages({build, env, output});

    await update({status: BUILDING});
    await buildImage({build, env, output, source});

    await update({status: PUSHING});
    await pushImages({build, env, output});
  } catch (er) {
    error = `${er.message || er}`;
  } finally {
    await endOutput();
    await update({error, status: error ? FAILED : SUCCEEDED});
  }
};
