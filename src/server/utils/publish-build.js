const _ = require('underscore');
const config = require('../config');
const getDb = require('./get-db');
const getEnv = require('./get-env');
const publishers = require('../publishers');
const sources = require('../sources');

module.exports = async ({build}) => {
  try {
    const env = await getEnv({id: build.envId});
    const source = sources[build.sourceId];
    const url = `${config.bob.url}/builds/${build.id}`;
    const meta = JSON.parse(JSON.stringify(
      _.extend({}, build.meta, {isPublished: true})
    ));
    try {
      await Promise.all(_.map(publishers, publish =>
        publish({build, env, meta, source, url})
      ));
    } catch (er) {
      console.error(er);
    }
    if (!_.isEqual(meta, build.meta)) {
      const db = await getDb();
      await db('builds').update({meta}).where({id: build.id});
    }
  } catch (er) {
    console.error(er);
  }
};
