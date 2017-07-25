const _ = require('underscore');
const getRole = require('../utils/get-role');
const ERRORS = require('../../shared/constants/errors');
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
        .andOnIn('permissions.userId', _.unique([user.id, 'public']))
      );
  }
  if (ids) sql.whereIn('id', ids);
  return _.map(await sql, env =>
    env.role & LEVELS.ADMIN ? env : _.omit(env, 'config')
  );
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

  'envsById.$key.permissionsByUserId':
  async ({1: envId, store: {cache: {user: {id: userId}}}}) => {
    const role = await getRole({envId, userId: userId});
    if (!(role & LEVELS.ADMIN)) throw ERRORS.FORBIDDEN;

    const db = await getDb();
    return {
      envsById: {
        [envId]: {
          permissionsByUserId: {
            $set: _.indexBy(
              await db('permissions').select().where({envId}),
              'userId'
            )
          }
        }
      }
    };
  },

  'createEnv!.$obj':
  async ({1: env, store: {cache: {user: {isRoot}}}}) => {
    if (!isRoot) throw ERRORS.FORBIDDEN;

    const {cid} = env;
    env = await saveEnv({env: _.omit(env, 'cid', 'id')});
    return {
      envsById: {[env.id]: {$merge: env}},
      envsByCid: {[cid]: {$set: {$ref: ['envsById', env.id]}}}
    };
  },

  'updateEnv!.$obj':
  async ({1: env, 1: {id}, store: {cache: {user: {id: userId}}}}) => {
    const role = await getRole({envId: id, userId});
    if (!(role & LEVELS.ADMIN)) throw ERRORS.FORBIDDEN;

    return {envsById: {[id]: {$merge: await saveEnv({env})}}};
  },

  'deleteEnv!.$key':
  async ({1: id, store: {cache: {user: {isRoot}}}}) => {
    if (!isRoot) throw ERRORS.FORBIDDEN;

    const db = await getDb();
    await db('envs').del().where({id});
    return {envsById: {[id]: {$set: null}}};
  },

  'createPermission!.$obj':
  async ({1: {envId, userId, role}, store: {cache: {user}}}) => {
    const userRole = await getRole({envId, userId: user.id});
    if (!(userRole & LEVELS.ADMIN)) throw ERRORS.FORBIDDEN;

    const db = await getDb();
    const [permission] = await db('permissions')
      .insert({envId, role, userId})
      .returning('*');
    return {
      envsById: {[envId]: {permissionsByUserId: {[userId]: {$set: permission}}}}
    };
  },

  'updatePermission!.$obj':
  async ({1: {envId, userId, role}, store: {cache: {user}}}) => {
    const userRole = await getRole({envId, userId: user.id});
    if (!(userRole & LEVELS.ADMIN)) throw ERRORS.FORBIDDEN;

    const db = await getDb();
    const [permission] = await db('permissions')
      .update({role})
      .where({envId, userId})
      .returning('*');
    return {
      envsById: {[envId]: {permissionsByUserId: {[userId]: {$set: permission}}}}
    };
  },

  'deletePermission!.$obj':
  async ({1: {envId, userId}, store: {cache: {user}}}) => {
    const role = await getRole({envId, userId: user.id});
    if (!(role & LEVELS.ADMIN)) throw ERRORS.FORBIDDEN;

    const db = await getDb();
    await db('permissions').del().where({envId, userId});
    return {
      envsById: {[envId]: {permissionsByUserId: {[userId]: {$unset: true}}}}
    };
  }
};
