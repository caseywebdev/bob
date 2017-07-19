const _ = require('underscore');
const getDb = require('./get-db');

const NOT_FOUND = _.extend(new Error(), {statusCode: 404});

module.exports = async ({id, slug}) => {
  const db = await getDb();
  const [env] = db('envs').select().where({id, slug});
  if (env) return _.extend({}, env.config, {id: env.id});

  throw NOT_FOUND;
};
