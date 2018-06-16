const {PENDING} = require('../../shared/constants/statuses');

exports.up = db =>
  db.schema
    .raw('CREATE EXTENSION IF NOT EXISTS citext')
    .createTable('envs', t => {
      t.uuid('id').primary();
      t.specificType('name', 'citext').notNullable().unique();
      t.json('config').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('users', t => {
      t.uuid('id').primary();
      t.string('name').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('userEmailAddresses', t => {
      t.uuid('id').primary();
      t.uuid('userId')
        .notNullable()
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .index();
      t.specificType('emailAddress', 'citext').notNullable().unique();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('emailAddressClaims', t => {
      t.uuid('id').primary();
      t.specificType('emailAddress', 'citext').notNullable().index();
      t.string('userAgent').notNullable();
      t.string('ipAddress').notNullable();
      t.binary('tokenHash');
      t.string('tokenHashAlgorithm');
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('userTokens', t => {
      t.uuid('id').primary();
      t.uuid('userId')
        .notNullable()
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .index();
      t.binary('tokenHash').notNullable();
      t.string('tokenHashAlgorithm').notNullable();
      t.integer('roles').notNullable();
      t.string('userAgent').notNullable();
      t.string('ipAddress').notNullable();
      t.string('name');
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('lastUsedAt');
    })

    .createTable('permissions', t => {
      t.uuid('id').primary();
      t.uuid('envId')
        .notNullable()
        .references('envs.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      t.uuid('userId')
        .notNullable()
        .references('envs.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      t.integer('roles').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
      t.unique(['envId', 'userId']);
    })

    .createTable('builds', t => {
      t.uuid('id').primary();
      t.uuid('envId')
        .notNullable()
        .references('envs.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .index();
      t.string('sourceId').notNullable().index();
      t.json('buildArgs');
      t.string('context');
      t.string('dockerfile');
      t.specificType('ref', 'citext').notNullable().index();
      t.specificType('repo', 'citext').notNullable().index();
      t.specificType('hash', 'citext').notNullable().index();
      t.jsonb('tags').notNullable().index();
      t.string('status').notNullable().defaultTo(PENDING);
      t.json('output');
      t.text('error');
      t.json('meta');
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    });

exports.down = ({schema}) =>
  schema
    .dropTable('builds')
    .dropTable('permissions')
    .dropTable('userTokens')
    .dropTable('userEmailAddresses')
    .dropTable('users')
    .dropTable('envs');
