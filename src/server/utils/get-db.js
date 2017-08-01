const config = require('../config');
const knex = require('knex');
const memoize = require('./memoize');
const vault = require('./root-vault');

const {postgres: {url: {value, vault: {path, key}}}} = config;

const getUrl = async () => value || (await vault.get(path))[key];

let db;
process.once('SIGTERM', async () => {
  if (db) {
    console.log('Destroying PG connection pool...');
    await db.destroy();
    console.log('PG connection pool destroyed');
  }
});

module.exports = memoize(async () =>
  db = knex({client: 'pg', connection: await getUrl()})
);
