const uuid = require('uuid/v4');
const createRandomToken = require('./create-random-token');

module.exports = async ({
  db,
  name,
  req: {headers: {'user-agent': userAgent}, ip: ipAddress},
  roles,
  userId
}) => {
  const id = uuid();
  const {token, tokenHash} = await createRandomToken();
  const [tokenRecord] = await db('tokens')
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
  return {...tokenRecord, token: id + token};
};
