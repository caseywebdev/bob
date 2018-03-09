const createToken = require('./create-token');
const uuid = require('uuid/v4');

module.exports = async ({
  db,
  name,
  req: {headers: {'user-agent': userAgent}, ip: ipAddress},
  roles,
  userId
}) => {
  const id = uuid();
  const {token, tokenHash} = await createToken({id});
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
