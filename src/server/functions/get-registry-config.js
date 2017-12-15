const _ = require('underscore');
const {ECR} = require('aws-sdk');
const getValue = require('./get-value');

const getEcrCreds = async ({
  accessKeyId,
  region,
  registryId,
  secretAccessKey
}) => {
  const ecr = new ECR({accessKeyId, region, secretAccessKey});
  let options = registryId ? {registryIds: [registryId]} : {};
  const [{authorizationToken: token}] =
    await ecr.getAuthorizationToken(options).promise();
  const [username, password] = Buffer.from(token, 'base64').split(':');
  return {username, password};
};

module.exports = async ({env, env: {config: {docker: {registryConfig}}}}) => {
  const config = await getValue({env, value: registryConfig});
  return _.object(await Promise.all(_.map(_.pairs(config), async ([k, v]) =>
    [k, v.ecr ? await getEcrCreds(v.ecr) : v]
  )));
};
