const config = require('../config');
const knex = require('knex');
const memoize = require('./memoize');
const getVault = require('./get-vault');

const {postgres: {url: {value, vault: {path, key}}}, vault} = config;

const getUrl = async () =>
  value || (await (await getVault({env: {config: {vault}}})).get(path))[key];

module.exports = memoize(async () =>
  knex({client: 'pg', connection: await getUrl()})
);
