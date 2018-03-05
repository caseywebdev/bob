const _ = require('underscore');
const {graphql} = require('graphql');
const bcrypt = require('bcrypt');
const DataLoader = require('dataloader');
const getDb = require('../../functions/get-db');
const schema = require('../../schema');

const ONE_DAY = 1000 * 60 * 60 * 24;

const getLoaders = ({db}) => ({
  users: new DataLoader(async ids => {
    const usersById = _.indexBy(await db('users').whereIn('id', ids), 'id');
    return ids.map(id => usersById[id]);
  })
});

module.exports = async ({
  req,
  req: {
    body: {operationName, query, variables},
    headers: {authorization}
  },
  res
}) => {
  let [type, auth = ''] = (authorization || '').split(/\s+/);

  if (type.toLowerCase() === 'basic') {
    try {
      const [left, right] = Buffer.from(auth, 'base64').toString().split(':');
      auth = left || right || '';
    } catch (er) {}
  }

  const db = await getDb();
  let token = null;
  const tokenId = auth.slice(0, 36);
  const tokenValue = auth.slice(36);
  if (tokenId && tokenValue) {
    token = await db('tokens').where({id: tokenId}).first();
    if (token && await bcrypt.compare(tokenValue, token.tokenHash)) {
      const now = new Date();
      if (now - token.lastUsedAt > ONE_DAY) {
        await db('tokens')
          .update({lastUsedAt: now, updatedAt: now})
          .where({id: tokenId});
      }
    } else {
      token = null;
    }
  }

  res.send(await graphql(
    schema,
    query,
    null,
    {db, loaders: getLoaders({db}), req, token},
    variables,
    operationName
  ));
};
