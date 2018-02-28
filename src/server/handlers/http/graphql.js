const {graphql} = require('graphql');
const bcrypt = require('bcrypt');
const getDb = require('../../functions/get-db');
const schema = require('../../schema');

module.exports = async ({
  req: {
    body: {operationName, query, variables},
    headers: {authorization = ''}
  },
  res
}) => {
  let [type, auth] = authorization.split(/\s+/);

  if (type.toLowerCase() === 'basic') {
    try {
      const [left, right] = Buffer.from(auth, 'base64').toString().split(':');
      auth = left || right;
    } catch (er) {}
  }

  const db = await getDb();
  let token = null;
  const [tokenId, tokenValue] = (auth || '').split('-');
  if (tokenId && tokenValue) {
    token = await db('tokens').where({id: tokenId}).first();
    if (!(await bcrypt.compare(tokenValue, token.tokenHash))) token = null;
  }

  res.send(await graphql(
    schema,
    query,
    null,
    {db, token},
    variables,
    operationName
  ));
};
