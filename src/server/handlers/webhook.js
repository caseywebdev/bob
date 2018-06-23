const _ = require('underscore');
const {FORBIDDEN} = require('../constants/errors');
const createBuilds = require('../functions/create-builds');
const getEnv = require('../functions/get-env');
const getRole = require('../functions/get-role');
const sources = require('../sources');

module.exports = async ({req, res}) => {
  const {envId, sourceId, token} = req.query;
  const env = await getEnv({id: envId});
  const source = sources[sourceId];
  if (!source) {
    throw _.extend(
      new Error(`Unknown source: '${sourceId}'`),
      {statusCode: 400}
    );
  }

  const role = await getRole({envId, userId: `token:${token}`});
  if (!(role & WRITE)) throw FORBIDDEN;

  const commit = await source.getCommitFromWebhook({env, req});
  if (!commit) return res.send([]);

  res.send(await createBuilds({commit, env, source}));
};
