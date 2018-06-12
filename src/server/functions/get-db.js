const config = require('../config');
const getValue = require('./get-value');
const knex = require('knex');
const memoize = require('./memoize');

const {postgres: {url}} = config;

let db;
process.once('SIGTERM', async () => {
  if (!db) return;

  console.log('Destroying PG connection pool...');
  await db.destroy();
  console.log('PG connection pool destroyed');
});

module.exports = memoize(async () =>
  db = knex({client: 'pg', connection: await getValue({value: url})})
);
