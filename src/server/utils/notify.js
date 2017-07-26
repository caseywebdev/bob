const getDb = require('./get-db');

module.exports = async ({channel, data}) => {
  const db = await getDb();
  return db.raw('NOTIFY ??, ?', [channel, JSON.stringify(data)]).toQuery();
};
