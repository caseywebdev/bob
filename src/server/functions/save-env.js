const _ = require('underscore');
const _str = require('underscore.string');
const getDb = require('./get-db');

const NAME_REQUIRED_ERROR = _.extend(
  new Error('`name` is required'),
  {statusCode: 400}
);

const CONFIG_REQUIRED_ERROR = _.extend(
  new Error('`config` is required to be an object'),
  {statusCode: 400}
);

module.exports = async ({env}) => {
  let {config, id, name} = env;
  name = _str.clean(_str.clean(name).slice(0, 32));
  if (!name) throw NAME_REQUIRED_ERROR;

  if (!config || !_.isObject(config)) throw CONFIG_REQUIRED_ERROR;

  env = _.extend({}, env, {name});
  const db = await getDb();
  if (!id) return (await db('envs').insert(env).returning('*'))[0];

  env.updatedAt = new Date();
  return (await db('envs').update(env).where({id}).returning('*'))[0];
};
