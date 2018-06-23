const {INVALID_TOKEN} = require('../constants/errors');
const getIdFromToken = require('./get-id-from-token');
const getDb = require('./get-db');
const getHash = require('./get-hash');

module.exports = async ({table, token}) => {
  const db = await getDb();

  const id = getIdFromToken(token);
  const record = await db(table).where({id}).first();

  if (!record) throw INVALID_TOKEN;

  const expectedHash = getHash({
    algorithm: record.tokenHashAlgorithm,
    buffer: token
  });
  if (!record.tokenHash.equals(expectedHash)) throw INVALID_TOKEN;

  return record;
};
