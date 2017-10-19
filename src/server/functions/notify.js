const getDb = require('./get-db');

module.exports = async ({channel, data}) => {
  const db = await getDb();
  const args = [].concat(channel, data ? JSON.stringify(data) : []);
  return db.raw(`NOTIFY ??${args.length > 1 ? ', ?' : ''}`, args).toQuery();
};
