const getDb = require('./get-db');
const NOT_FOUND = require('../constants/errors');

module.exports = async ({id}) => {
  const db = await getDb();
  const [env] = await db('envs').select().where({id});
  if (env) return env;

  throw NOT_FOUND;
};
