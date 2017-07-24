const _ = require('underscore');
const {WRITE} = require('../../../shared/constants/permission-levels');
const createBuilds = require('../../utils/create-builds');
const getEnv = require('../../utils/get-env');
const getRole = require('../../utils/get-role');
const sources = require('../../sources');

module.exports = async ({req, res}) => {
  const {params: {envId, sourceId}, query: {token}} = req;
  const env = await getEnv({id: envId});
  const source = sources[sourceId];
  if (!source) {
    throw _.extend(
      new Error(`Unknown source: '${sourceId}'`),
      {statusCode: 400}
    );
  }

  const role = await getRole({envId, userId: `token:${token}`});
  if (!(role & WRITE)) throw _.extend(new Error(), {statusCode: 403});

  const commit = await source.getCommitFromWebhook({env, req});
  if (!commit) return res.send([]);

  res.send(await createBuilds({commit, env, source}));
};
