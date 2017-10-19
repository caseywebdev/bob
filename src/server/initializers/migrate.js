const getDb = require('../functions/get-db');

module.exports = async () => {
  const db = await getDb();
  return db.migrate.latest({directory: 'src/server/migrations'});
};
