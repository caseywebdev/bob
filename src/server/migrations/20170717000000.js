const {PENDING} = require('../../shared/constants/statuses');

exports.up = db =>
  db.schema
    .raw('CREATE EXTENSION IF NOT EXISTS citext')
    .createTable('envs', t => {
      t.increments('id').primary();
      t.specificType('name', 'citext').notNullable().unique();
      t.json('config').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('users', t => {
      t.increments('id').primary();
      t.string('passwordHash').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('emailAddresses', t => {
      t.increments('id').primary();
      t.integer('userId')
        .notNullable()
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .index();
      t.string('emailAddress').notNullable().unique();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('tokens', t => {
      t.increments('id').primary();
      t.integer('userId')
        .notNullable()
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .index();
      t.string('tokenHash').notNullable().unique();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('permissions', t => {
      t.integer('envId')
        .notNullable()
        .references('envs.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      t.integer('userId')
        .notNullable()
        .references('envs.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      t.integer('role').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
      t.primary(['envId', 'userId']);
    })

    .createTable('builds', t => {
      t.increments('id').primary();
      t.integer('envId')
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
    .dropTable('tokens')
    .dropTable('emailAddresses')
    .dropTable('users')
    .dropTable('envs');
