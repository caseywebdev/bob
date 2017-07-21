const _ = require('underscore');
const config = require('../config');
const getEnv = require('./get-env');
const publishers = require('../publishers');
const sources = require('../sources');

module.exports = async ({build}) => {
  try {
    const env = await getEnv({envId: build.envId});
    const source = sources[build.sourceId];
    const url = `${config.bob.url}/envs/${env.slug}/builds/${build.id}`;
    await Promise.all(_.map(publishers, publish =>
      publish({build, env, source, url})
    ));
  } catch (er) {
    console.error(er);
  }
};
