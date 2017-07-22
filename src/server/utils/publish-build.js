const _ = require('underscore');
const config = require('../config');
const getEnv = require('./get-env');
const publishers = require('../publishers');
const sources = require('../sources');

module.exports = async ({build}) => {
  try {
    const env = await getEnv({id: build.envId});
    const source = sources[build.sourceId];
    const url = `${config.bob.url}/builds/${build.id}`;
    await Promise.all(_.map(publishers, publish =>
      publish({build, env, source, url})
    ));
  } catch (er) {
    console.error(er);
  }
};
