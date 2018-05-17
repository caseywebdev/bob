const createToken = require('./create-token');
const getDb = require('./get-db');
const uuid = require('uuid/v4');

module.exports = async ({
  ipAddress,
  name,
  roles,
  userAgent,
  userId
}) => {
  const id = uuid();
  const {token, tokenHash} = await createToken({id});
  const db = await getDb();
  const [userToken] = await db('userTokens')
    .insert({
      id,
      name,
      tokenHash,
      roles: roles.reduce((roles, role) => roles | role, 0),
      userId,
      userAgent,
      ipAddress
    })
    .returning('*');
  return {...userToken, token};
};
