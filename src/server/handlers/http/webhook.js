const _ = require('underscore');
const {WRITE} = require('../../../shared/constants/permission-levels');
const createBuilds = require('../../utils/create-builds');
const getEnv = require('../../utils/get-env');
const hasPermission = require('../../utils/has-permission');
const sources = require('../../sources');

module.exports = async (req, res) => {
  const {params: {envSlug, sourceId}, query: {token}} = req;
  const source = sources[sourceId];
  if (!source) {
    throw _.extend(
      new Error(`Unknown source: '${sourceId}'`),
      {statusCode: 400}
    );
  }

  const env = await getEnv({slug: envSlug});
  const auth = `token:${token}`;
  if (!(await hasPermission({auth, envId: env.id, level: WRITE}))) {
    throw _.extend(new Error(), {statusCode: 403});
  }

  const commit = await source.getCommitFromWebhook({env, req});
  if (!commit) return res.send([]);

  res.send(await createBuilds({commit, env, source}));
};
