const knex = require('knex');

const db = knex({client: 'pg'});

module.exports = (sql, bindings) => db.raw(sql, bindings).toString();
