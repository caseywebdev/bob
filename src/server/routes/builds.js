const _ = require('underscore');
const createBuild = require('../utils/create-build');
const ERRORS = require('../../shared/constants/errors');
const getDb = require('../utils/get-db');
const LEVELS = require('../../shared/constants/permission-levels');
const ROLES = require('../../shared/constants/permission-roles');

const getBuilds = async ({ids, user, withOutput}) => {
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
        .onIn('permissions.userId', _.unique([user.id, 'public']))
        .on(db.raw('permissions.role & ? > 0', [LEVELS.READ]))
      );
  }
  if (ids) sql.whereIn('id', ids);
  const builds = _.map(await sql, build =>
    _.extend({}, build, {env: {$ref: ['envsById', build.envId]}})
  );
  return withOutput ? builds : _.map(builds, build => _.omit(build, 'output'));
};

module.exports = {
  builds: async ({store: {cache: {user}}}) => {
    const builds = await getBuilds({user});
    return {
      builds: {$set: _.map(builds, ({id}) => ({$ref: ['buildsById', id]}))},
      buildsById: _.mapObject(_.indexBy(builds, 'id'), build => ({
        $merge: build
      }))
    };
  },

  'buildsById.$keys': async ({1: ids, store: {cache: {user}}}) => {
    const builds = await getBuilds({ids, user});
    return {
      buildsById: _.mapObject(_.indexBy(builds, 'id'), build => ({
        $merge: build
      }))
    };
  },

  'buildsById.$keys.output': async ({1: ids, store: {cache: {user}}}) => {
    const builds = await getBuilds({ids, user, withOutput: true});
    return {
      buildsById: _.mapObject(_.indexBy(builds, 'id'), build => ({
        $merge: build
      }))
    };
  },

  'getBuildUpdates!.$obj':
  async ({1: {id, lastOutputAt, lastUpdatedAt}, store: {cache: {user}}}) => {
    const withOutput = lastOutputAt != null;
    const [build] = await getBuilds({ids: [id], user, withOutput});
    if (!build) return ERRORS.NOT_FOUND;

    const delta = [];
    if (lastUpdatedAt && lastUpdatedAt < `${build.updatedAt}`) {
      delta.push({buildsById: {[id]: {$merge: _.omit(build, 'output')}}});
    }

    if (withOutput) {
      const output = _.pick(
        _.map(build.output, ([at, text]) =>
          at > lastOutputAt && {$set: [at, text]}
        ),
        _.identity
      );
      if (!_.isEmpty(output)) delta.push({buildsById: {[id]: {output}}});
    }

    if (delta.length) return delta;
  },

  'rebuild!.$obj':
  async ({1: {cid, id}, store: {cache: {user}}}) => {
    const [build] = await getBuilds({ids: [id], user});
    if (!build) throw ERRORS.NOT_FOUND;

    if (!(build.role & LEVELS.WRITE)) throw ERRORS.FORBIDDEN;

    const rebuild = await createBuild(build);
    return {
      buildsById: {[rebuild.id]: {$set: rebuild}},
      buildsByCid: {[cid]: {$set: {$ref: ['buildsById', rebuild.id]}}}
    };
  }
};
