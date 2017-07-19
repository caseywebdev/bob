const _ = require('underscore');
const getDb = require('./get-db');

const NOT_FOUND = _.extend(new Error(), {statusCode: 404});

module.exports = async ({id, slug}) => {
  const db = await getDb();
  const [env] = await db('envs').select().where(_.pick({id, slug}));
  if (env) return env;

  throw NOT_FOUND;
};
