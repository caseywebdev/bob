const {GraphQLInt, GraphQLNonNull, GraphQLString} = require('graphql');
const DataLoader = require('dataloader');
const getDb = require('../../functions/get-db');
const isUuid = require('../../functions/is-uuid');
const hasPermission = require('../../functions/has-permission');
const {READ_BUILD} = require('../../constants/roles');

module.exports = {
  args: {
    after: {type: GraphQLString},
    first: {type: GraphQLInt}
  },
  type: new GraphQLNonNull(require('../build-connection')),
  resolve: async (obj, {after, first = 0}, {userToken}) => {
    if (!userToken) throw new Error('Authentication is required');

    if (!hasPermission(userToken.roles, READ_BUILD)) {
      throw new Error('The `READ_BUILD` role is required');
    }

    if (first < 0) throw new Error('`first` cannot be negative');

    if (first > 100) throw new Error('`first` cannot be more than 100');

    if (after) {
      try {
        after = JSON.parse(Buffer.from(after, 'base64'));
        const {createdAt, id} = after;
        if (!isUuid(id) || !(new Date(createdAt)).toJSON()) throw new Error();
      } catch (er) {
        throw new Error('`cursor` is invalid');
      }
    }

    const db = await getDb();
    const sql = db('builds')
      .join('envs', 'envs.id', 'builds.envId')
      .join('envUsers', 'envUsers.envId', 'envs.id')
      .where({'envUsers.userId': userToken.userId})
      .where(db.raw(`"envUsers".roles & ${READ_BUILD} > 0`));

    const queries = {
      records: sql
        .clone()
        .select('builds.*')
        .orderBy('createdAt', 'desc')
        .orderBy('id')
        .limit(first),
      total: sql
        .clone()
        .count()
    };

    if (after) {
      queries
        .records
        .where('createdAt', 'gt', after.createdAt)
        .where('id', 'gt', after.id);
    }

    return {
      loader: new DataLoader(async types =>
        await Promise.all(types.map(async type => await queries[type]))
      )
    };
  }
};
