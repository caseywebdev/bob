const _ = require('underscore');
const {toKey} = require('pave');
const createBuild = require('../utils/create-build');
const ERRORS = require('../../shared/constants/errors');
const getDb = require('../utils/get-db');
const LEVELS = require('../../shared/constants/permission-levels');
const ROLES = require('../../shared/constants/permission-roles');
const STATUSES = require('../../shared/constants/statuses');
const updateBuildStatus = require('../utils/update-build-status');

const getBuilds = async ({
  before,
  ids,
  justLength,
  limit,
  offset,
  user,
  withOutput
}) => {
  const db = await getDb();
  const sql = db('builds');

  if (justLength) {
    sql.countDistinct('id as length');
  } else {
    sql
      .distinct(db.raw('ON (id) *'))
      .orderBy('id', 'desc')
      .select(user.isRoot ? db.raw(`${ROLES.ADMIN} as role`) : 'role');
  }

  if (!user.isRoot) {
    sql
      .innerJoin('permissions', sql => sql
        .on('builds.envId', 'permissions.envId')
        .onIn('permissions.userId', _.unique([user.id, 'public']))
        .on(db.raw('permissions.role & ? > 0', [LEVELS.READ]))
      );
  }

  if (ids) sql.whereIn('id', ids);

  if (before) sql.where('builds.createdAt', '<', before);

  if (justLength) return parseInt((await sql)[0].length);

  if (offset) sql.offset(offset);

  if (limit) sql.limit(limit);

  const builds = _.map(await sql, build =>
    _.extend(
      {},
      withOutput ? build : _.omit(build, 'output'),
      {env: {$ref: ['envsById', build.envId]}}
    )
  );

  return builds;
};

module.exports = {
  'builds.$obj.$keys': async ({
    1: options,
    1: {before},
    2: indices,
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
      limit: max - min + 1,
      offset: min,
      user
    }) : [];
    return {
      builds: {
        [toKey(options)]: _.extend(
          {},
          length == null ? {} : {length: {$set: length}},
          _.mapObject(builds, ({id}) => ({
            $set: {$ref: ['buildsById', id]}
          }))
        )
      },
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
    if (lastUpdatedAt && new Date(lastUpdatedAt) < build.updatedAt) {
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
  },

  'cancelBuild!.$key':
  async ({1: id, store: {cache: {user}}}) => {
    let [build] = await getBuilds({ids: [id], user});
    if (!build) throw ERRORS.NOT_FOUND;

    if (!(build.role & LEVELS.WRITE)) throw ERRORS.FORBIDDEN;

    await updateBuildStatus({
      buildId: build.id,
      status: STATUSES.CANCELLED,
      unless: [STATUSES.CANCELLED, STATUSES.FAILED, STATUSES.SUCCEEDED]
    });
    build = (await getBuilds({ids: [id], user}))[0];
    if (!build) throw ERRORS.NOT_FOUND;

    return {buildsById: {[id]: {$merge: build}}};
  }
};
