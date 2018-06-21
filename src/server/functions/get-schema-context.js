const _ = require('underscore');
const DataLoader = require('dataloader');
const getDb = require('../functions/get-db');
const verifyUserToken = require('../functions/verify-user-token');

const getLoaders = () => ({
  users: new DataLoader(async ids => {
    const db = await getDb();
    const usersById = _.indexBy(await db('users').whereIn('id', ids), 'id');
    return ids.map(id => usersById[id]);
  }),
  userEmailAddressesByUser: new DataLoader(async userIds => {
    const db = await getDb();
    const uea = await db('userEmailAddresses').whereIn('userId', userIds);
    const ueaByUserId = _.groupBy(uea, 'userId');
    return userIds.map(userId => ueaByUserId[userId] || []);
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

module.exports = async ({authorization, req}) => ({
  loaders: getLoaders(),
  req,
  userToken: await getUserToken({authorization})
});
