const _ = require('underscore');
const {listen, unlisten} = require('../utils/db-channels');
const createBuild = require('../utils/create-build');
const ERRORS = require('../../shared/constants/errors');
const getDb = require('../utils/get-db');
const getRole = require('../utils/get-role');
const LEVELS = require('../../shared/constants/permission-levels');

const socketListen = async ({cb, channel, socket}) => {
  const {listeners} = socket;
  if (listeners[channel]) return;

  listeners[channel] = cb;
  try {
    await listen(channel, cb);
  } catch (er) {
    delete listeners[channel];
    throw er;
  }
};

const socketUnlisten = async ({channel, socket}) => {
  const {listeners} = socket;
  const {cb} = listeners[channel] || {};
  if (!cb) return;

  delete listeners[channel];
  try {
    await unlisten(channel, cb);
  } catch (er) {
    listeners[channel] = cb;
    throw er;
  }
};

module.exports = {
  builds: async () => {
    const db = await getDb();
    const builds = await db('builds').select();
    return {
      builds: {$set: _.map(builds, ({id}) => ({$ref: ['buildsById', id]}))},
      buildsById: _.mapObject(_.indexBy(builds, 'id'), build => ({
        $merge: _.extend({}, build, {env: {$ref: ['envsById', build.envId]}})
      }))
    };
  },

  'buildsById.$keys': async ({1: ids}) => {
    const db = await getDb();
    const builds = await db('builds').select().whereIn('id', ids);
    return {
      buildsById: _.mapObject(_.indexBy(builds, 'id'), build => ({
        $set: _.extend({}, build, {env: {$ref: ['envsById', build.envId]}})
      }))
    };
  },

  'rebuild!.$obj':
  async ({1: {cid, id}, store: {cache: {user: {id: userId}}}}) => {
    const db = await getDb();
    const [build] = await db('builds').select().where({id});
    if (!build) throw ERRORS.NOT_FOUND;

    const {envId} = build;
    const role = await getRole({envId, userId});
    if (!(role & LEVELS.WRITE)) throw ERRORS.FORBIDDEN;

    const rebuild = await createBuild(build);
    return {
      buildsById: {[rebuild.id]: {$set: rebuild}},
      buildsByCid: {[cid]: {$set: {$ref: ['buildsById', rebuild.id]}}}
    };
  },

  'listenToBuilds!':
  async ({store: {cache: {socket, user: {id: userId}}}}) => {
    if (!socket) throw ERRORS.WEB_SOCKET_ONLY;

    await socketListen({
      cb: async build => {
        const {id, envId} = build;
        const role = await getRole({envId, userId});
        if (role & LEVELS.READ) {
          socket.live.send('pave', {buildsById: {[id]: {$merge: build}}});
        }
      },
      channel: 'build',
      socket
    });
  },

  'unlistenToBuilds!':
  async ({store: {cache: {socket}}}) => {
    if (!socket) throw ERRORS.WEB_SOCKET_ONLY;

    await socketUnlisten({channel: 'build', socket});
  },

  'listenToBuild!.$key':
  async ({1: id, store: {cache: {socket, user}}}) => {
    if (!socket) throw ERRORS.WEB_SOCKET_ONLY;

    const db = await getDb();
    const [build] = await db('builds').select().where({id});
    if (!build) throw ERRORS.NOT_FOUND;

    const role = await getRole({envId: build.envId, userId: user.id});
    if (!(role & LEVELS.READ)) throw ERRORS.FORBIDDEN;

    await Promise.all([
      socketListen({
        cb: build =>
          socket.live.send('pave', {buildsById: {[id]: {$merge: build}}}),
        channel: `build:${id}`,
        socket
      }),
      socketListen({
        cb: logLine =>
          socket.live.send('pave', {
            buildsById: {[id]: {logLines: {[logLine.index]: {$set: logLine}}}}
          }),
        channel: `build:${id}:logLine`,
        socket
      })
    ]);
  },

  'unlistenToBuild!.$key':
  async ({1: id, store: {cache: {socket}}}) => {
    if (!socket) throw ERRORS.WEB_SOCKET_ONLY;

    await Promise.all([
      socketUnlisten({channel: `build:${id}`, socket}),
      socketUnlisten({channel: `build:${id}:logLine`, socket})
    ]);
  },

  'buildsById.$key.logLines':
  async ({1: buildId, store: {cache: {user}}}) => {
    const db = await getDb();
    const [build] = await db('builds').select().where({id: buildId});
    if (!build) throw ERRORS.NOT_FOUND;

    const role = await getRole({envId: build.envId, userId: user.id});
    if (!(role & LEVELS.READ)) throw ERRORS.FORBIDDEN;

    return {
      buildsById: {
        [buildId]: {
          logLines: {
            $merge: _.indexBy(
              await db('logLines').select().where({buildId}),
              'index'
            )
          }
        }
      }
    };
  }
};
