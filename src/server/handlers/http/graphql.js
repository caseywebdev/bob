const _ = require('underscore');
const {graphql} = require('graphql');
const DataLoader = require('dataloader');
const getDb = require('../../functions/get-db');
const schema = require('../../schema');
const verifyUserToken = require('../../functions/verify-user-token');

const getLoaders = () => ({
  users: new DataLoader(async ids => {
    const db = await getDb();
    const usersById = _.indexBy(await db('users').whereIn('id', ids), 'id');
    return ids.map(id => usersById[id]);
  })
});

const getToken = ({authorization}) => {
  let [type, token = ''] = (authorization || '').split(/\s+/);

  if (type.toLowerCase() === 'basic') {
    try {
      const [left, right] = Buffer.from(token, 'base64').toString().split(':');
      token = left || right || '';
    } catch (er) {}
  }

  return token;
};

const getUserToken = async ({authorization}) => {
  const token = getToken({authorization});
  if (token) return await verifyUserToken({token});
};

module.exports = async ({
  req,
  req: {body: {operationName, query, variables}, headers: {authorization}},
  res
}) =>
  res.send(await graphql(
    schema,
    query,
    null,
    {
      loaders: getLoaders(),
      req,
      userToken: await getUserToken({authorization})
    },
    variables,
    operationName
  ));
