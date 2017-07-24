const _ = require('underscore');
const {listen, unlisten} = require('../utils/db-channels');
const getRole = require('../utils/get-role');
const {FORBIDDEN, NOT_FOUND, WEB_SOCKET_ONLY} = require('../../shared/constants/errors');
const LEVELS = require('../../shared/constants/permission-levels');
const ROLES = require('../../shared/constants/permission-roles');
const saveEnv = require('../utils/save-env');

const getDb = require('../utils/get-db');

const getEnvs = async ({ids, user}) => {
  const db = await getDb();
  const sql = db('envs')
    .distinct(db.raw('ON (name, id) *'))
    .orderBy('name')
    .orderBy('id');
  if (user.isRoot) {
    sql.select(db.raw(`${ROLES.ADMIN} as role`));
  } else {
    sql
      .select('role')
      .innerJoin('permissions', sql => sql
        .on('envs.id', 'permissions.envId')
        .andOn('permissions.userId', _.unique([user.id, 'public']))
      );
  }
  if (ids) sql.whereIn('id', ids);
  return sql;
};

module.exports = {
  envs: async ({store: {cache: {user}}}) => {
    const envs = await getEnvs({user});
    return {
      envs: {$set: _.map(envs, ({id}) => ({$ref: ['envsById', id]}))},
      envsById: _.mapObject(_.indexBy(envs, 'id'), env => ({$merge: env}))
    };
  },

  'envsById.$keys': async ({1: ids, store: {cache: {user}}}) => {
    const envs = await getEnvs({ids, user});
    return {
      envsById: _.mapObject(_.indexBy(envs, 'id'), env => ({$merge: env}))
    };
  },

  'envsById.$key.permissions':
  async ({1: envId, store: {cache: {user: {id: userId}}}}) => {
    const role = await getRole({envId, userId: userId});
    if (!(role & ROLES.ADMIN)) throw FORBIDDEN;

    const db = await getDb();
    return {
      envsById: {
        [envId]: {
          permissions: {
            $set: await db('permissions').select().where({envId})
          }
        }
      }
    };
  },

  'createEnv!.$obj':
  async ({1: env, store: {cache: {user: {isRoot}}}}) => {
    if (!isRoot) throw FORBIDDEN;

    env = await saveEnv({env: _.omit(env, 'id')});
    return {envsById: {[env.id]: {$merge: env}}};
  },

  'updateEnv!.$obj':
  async ({1: env, 1: {id}, store: {cache: {user: {id: userId}}}}) => {
    const role = await getRole({envId: id, userId: userId});
    if (!(role & ROLES.ADMIN)) throw FORBIDDEN;

    env = await saveEnv({env});
    return {envsById: {[env.id]: {$merge: env}}};
  },

  'deleteEnv!.$key':
  async ({1: id, store: {cache: {user: {isRoot}}}}) => {
    if (!isRoot) throw FORBIDDEN;

    const db = await getDb();
    await db('envs').del().where({id});
    return {envsById: {[id]: {$set: null}}};
  }
};
