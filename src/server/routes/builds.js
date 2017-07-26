const _ = require('underscore');
const createBuild = require('../utils/create-build');
const ERRORS = require('../../shared/constants/errors');
const getDb = require('../utils/get-db');
const getRole = require('../utils/get-role');
const LEVELS = require('../../shared/constants/permission-levels');

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
  }
};
