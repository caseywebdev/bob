const _ = require('underscore');
const {toKey} = require('pave');
const createBuild = require('../functions/create-build');
const ERRORS = require('../constants/errors');
const getDb = require('../functions/get-db');
const LEVELS = require('../constants/permission-levels');
const ROLES = require('../constants/permission-roles');
const STATUSES = require('../constants/statuses');
const updateBuildStatus = require('../functions/update-build-status');

const getBuilds = async ({
  before,
  ids,
  justLength,
  keys,
  limit,
  offset,
  user
}) => {
  const db = await getDb();
  const sql = db('builds');

  if (justLength) {
    sql.countDistinct('builds.id as length');
  } else {
    sql
      .distinct(db.raw('ON (builds.id) builds.id'))
      .select('builds.envId')
      .orderBy('builds.id', 'desc')
      .select(user.isRoot ? db.raw(`${ROLES.ADMIN} as role`) : 'role');
    if (keys) sql.select(_.map(keys, key => `builds.${key}`));
  }

  if (!user.isRoot) {
    sql
      .innerJoin('permissions', sql => sql
        .on('builds.envId', 'permissions.envId')
        .onIn('permissions.userId', _.unique([user.id, 'public']))
        .on(db.raw('permissions.role & ? > 0', [LEVELS.READ]))
      );
  }

  if (ids) sql.whereIn('builds.id', ids);

  if (before) sql.where('builds.createdAt', '<', before);

  if (justLength) return parseInt((await sql)[0].length);

  if (offset) sql.offset(offset);

  if (limit) sql.limit(limit);

  return _.map(await sql, build =>
    _.extend({}, build, {env: {$ref: ['envsById', build.envId]}})
  );
};

module.exports = {
  'builds.$obj.$keys.$keys': async ({
    1: options,
    1: {before},
    2: indices,
    3: keys,
    store: {cache: {user}}
  }) => {
    let length;
    if (_.contains(indices, 'length')) {
      length = await getBuilds({before, indices, justLength: true, user});
    }

    indices = _.reject(indices, isNaN);
    const min = _.min(indices);
    const max = _.max(indices);
    const builds = indices.length ? await getBuilds({
      before,
      keys,
      limit: max - min + 1,
      offset: min,
      user
    }) : [];
    return {
      builds: {
        [toKey(options)]: _.extend(
          {},
          length == null ? {} : {length: {$set: length}},
          _.reduce(builds, (obj, {id}, index) => _.extend(obj, {
            [min + index]: {$set: {$ref: ['buildsById', id]}}
          }), {})
        )
      },
      buildsById: _.mapObject(_.indexBy(builds, 'id'), build => ({
        $merge: build
      }))
    };
  },

  'buildsById.$keys.$keys': async ({
    1: ids,
    2: keys,
    store: {cache: {user}}
  }) => {
    const builds = await getBuilds({ids, keys, user});
    return {
      buildsById: _.mapObject(_.indexBy(builds, 'id'), build => ({
        $merge: build
      }))
    };
  },

  'getBuildUpdates!.$obj.$keys':
  async ({
    1: {id, lastOutputAt, lastUpdatedAt},
    2: keys,
    store: {cache: {user}}
  }) => {
    const [build] = await getBuilds({ids: [id], keys, user});
    if (!build) return ERRORS.NOT_FOUND;

    const delta = [];
    if (lastUpdatedAt && new Date(lastUpdatedAt) < build.updatedAt) {
      delta.push({buildsById: {[id]: {$merge: _.omit(build, 'output')}}});
    }

    if (_.contains(keys, 'output') && lastOutputAt != null) {
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
    const [build] = await getBuilds({ids: [id], keys: ['*'], user});
    if (!build) throw ERRORS.NOT_FOUND;

    if (!(build.role & LEVELS.WRITE)) throw ERRORS.FORBIDDEN;

    const rebuild = await createBuild(build);
    return {
      buildsById: {[rebuild.id]: {$set: _.omit(rebuild, 'build')}},
      buildsByCid: {[cid]: {$set: {$ref: ['buildsById', rebuild.id]}}}
    };
  },

  'cancelBuild!.$key':
  async ({1: id, store: {cache: {user}}}) => {
    let [build] = await getBuilds({ids: [id], user});
    if (!build) throw ERRORS.NOT_FOUND;

    if (!(build.role & LEVELS.WRITE)) throw ERRORS.FORBIDDEN;

    build = await updateBuildStatus({
      buildId: build.id,
      status: STATUSES.CANCELLED,
      unless: [STATUSES.CANCELLED, STATUSES.FAILED, STATUSES.SUCCEEDED]
    });
    if (!build) throw ERRORS.FORBIDDEN;

    return {buildsById: {[id]: {$merge: build}}};
  }
};
