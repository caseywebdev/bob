const _ = require('underscore');
const {listen, unlisten} = require('../utils/db-channels');
const getRole = require('../utils/get-role');
const {FORBIDDEN, NOT_FOUND, WEB_SOCKET_ONLY} = require('../../shared/constants/errors');

const getDb = require('../utils/get-db');

module.exports = {
  builds: async () => {
    const db = await getDb();
    const builds = await db('builds').select();
    return {
      builds: {$set: _.map(builds, ({id}) => ({$ref: ['buildsById', id]}))},
      buildsById: _.mapObject(_.indexBy(builds, 'id'), build => ({
        $set: _.extend({}, build, {env: {$ref: ['envsById', build.envId]}})
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
  //   if (user.isRoot) {
  //     envs = await db('envs').select()
  //   const db = await getDb();
  //   const envs = await db('envs')
  //     .select('envs.*', 'permissions.role').
  //     .innerJoin('permissions', sql => sql
  //       .on('envs.id', '=', 'permissions.envId')
  //       .andOn('')
  // }),
  //
  // 'envsById.$key': async ({1: id, store: {cache: {user}}}) => {
  //   const role = await getRole({envId, userId: user.id});
  //   if (!(role & READ)) throw FORBIDDEN;
  //
  //   const env = getEnv({id, user});
  // },
  //
  'listenToBuild!.$key':
  async ({1: id, store: {cache: {socket, user}}}) => {
    if (!socket) throw WEB_SOCKET_ONLY;

    const db = await getDb();
    const builds = await db('builds').select().whereIn('id', ids);
    const role = await hasPermission({envId, level: READ, userId: user.id});
    if (!allowed) throw FORBIDDEN;
  },

  'listenToBuildLogLines!.$key':
  async ({1: id, store: {cache: {socket, user}}}) => {
    if (!socket) throw WEB_SOCKET_ONLY;

    const db = await getDb();
    const [build] = await db('builds').select().where({id});
    if (!build) throw NOT_FOUND;

    const role = await getRole({envId: build.envId, userId: user.id});
    if (!(role & READ)) throw FORBIDDEN;

    const channel = `build:${id}:logLine`;
    if (socket.listeners[channel]) return;

    const cb = logLine =>
      socket.live.send('pave', {
        buildsById: {[id]: {logLines: {[logLine.index]: {$set: logLine}}}}
      });
    socket.listeners[channel] = cb;
    try {
      await listen(channel, cb);
    } catch (er) {
      delete socket.listeners[channel];
      throw er;
    }
  },

  'buildsById.$key.logLines':
  async ({1: buildId, store: {cache: {user}}}) => {
    const db = await getDb();
    const [build] = await db('builds').select().where({id: buildId});
    if (!build) throw NOT_FOUND;

    const role = await getRole({envId: build.envId, userId: user.id});
    if (!(role & READ)) throw FORBIDDEN;

    return {
      buildsById: {
        [buildId]: {
          logLines: {$merge: await db('logLines').where({buildId})}
        }
      }
    };
  }
};
