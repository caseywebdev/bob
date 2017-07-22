const _ = require('underscore');
const getUser = require('../utils/get-user');
const {listen, unlisten} = require('../utils/db-channels');
const getRole = require('../utils/get-role');
const {FORBIDDEN} = require('../../shared/constants/errors');
const {ADMIN, READ} = require('../../shared/constants/permission-levels');

const cleanEnv = ({env, role}) => role & ADMIN ? env : _.omit(env, 'config');

const getDb = require('../utils/get-db');

module.exports = {
  'signIn!.*': async ({1: [auth], store: {cache: {socket}}}) => ({
    user: {$set: (socket || {}).user = await getUser({auth})}
  }),

  'signOut!': async ({store: {cache: {socket}}}) => ({
    user: {$set: (socket || {}).user = await getUser()}
  }),

  user: async ({store: {cache: {user}}}) => ({user: {$set: user}}),

  envs: async () => {
    const db = await getDb();
    const envs = await db('envs').select();
    return {
      envs: {$set: _.map(envs, ({id}) => ({$ref: ['envsById', id]}))},
      envsById: _.mapObject(_.indexBy(envs, 'id'), env => ({$set: env}))
    };
  },

  'envsById.$keys': async ({1: ids}) => {
    const db = await getDb();
    const envs = await db('envs').select().whereIn('id', ids);
    return {
      envsById: _.mapObject(_.indexBy(envs, 'id'), env => ({$set: env}))
    };
  },

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
  }
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
  // 'listenToBuild!.$key':
  // async ({1: envId, store: {cache: {socket, user}}}) => {
  //   const role = await hasPermission({envId, level: READ, userId: user.id});
  //   if (!allowed) throw FORBIDDEN;
  // }
};
