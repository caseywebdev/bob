const _ = require('underscore');
const createBuild = require('../utils/create-build');
const ERRORS = require('../../shared/constants/errors');
const getDb = require('../utils/get-db');
const getRole = require('../utils/get-role');
const LEVELS = require('../../shared/constants/permission-levels');
const ROLES = require('../../shared/constants/permission-roles');

const getBuilds = async ({ids, user}) => {
  const db = await getDb();
  const sql = db('builds')
    .distinct(db.raw('ON (id) *'))
    .orderBy('id', 'desc');
  if (user.isRoot) {
    sql.select(db.raw(`${ROLES.ADMIN} as role`));
  } else {
    sql
      .select('role')
      .innerJoin('permissions', sql => sql
        .on('builds.envId', 'permissions.envId')
        .andOnIn('permissions.userId', _.unique([user.id, 'public']))
      );
  }
  if (ids) sql.whereIn('id', ids);
  return _.map(await sql, env =>
    env.role & LEVELS.ADMIN ? env : _.omit(env, 'config')
  );
};

module.exports = {
  builds: async ({store: {cache: {user}}}) => {
    const builds = await getBuilds({user});
    return {
      builds: {$set: _.map(builds, ({id}) => ({$ref: ['buildsById', id]}))},
      buildsById: _.mapObject(_.indexBy(builds, 'id'), build => ({
        $merge: _.extend({}, build, {env: {$ref: ['envsById', build.envId]}})
      }))
    };
  },

  'buildsById.$keys': async ({1: ids, store: {cache: {user}}}) => {
    const builds = await getBuilds({ids, user});
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
  }
};
