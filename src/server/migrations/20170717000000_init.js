const {PENDING} = require('../../shared/constants/statuses');

exports.up = db =>
  db.schema
    .raw('CREATE EXTENSION IF NOT EXISTS citext')
    .createTable('envs', t => {
      t.increments('id').primary();
      t.string('slug').notNullable().unique();
      t.string('name').notNullable();
      t.json('config').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('permissions', t => {
      t.integer('envId').notNullable().references('envs.id').onUpdate('CASCADE').onDelete('CASCADE');
      t.string('userId').notNullable();
      t.integer('level').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
      t.primary(['envId', 'userId']);
    })

    .createTable('builds', t => {
      t.increments('id').primary();
      t.integer('envId').notNullable().references('envs.id').onUpdate('CASCADE').onDelete('CASCADE').index();
      t.string('sourceId').notNullable();
      t.json('buildArgs');
      t.string('context');
      t.string('dockerfile');
      t.specificType('ref', 'citext').notNullable().index();
      t.specificType('repo', 'citext').notNullable().index();
      t.specificType('sha', 'citext').notNullable().index();
      t.jsonb('tags').notNullable().index();
      t.string('status').notNullable().defaultTo(PENDING);
      t.string('error');
      t.json('meta');
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('logLines', t => {
      t.integer('buildId').notNullable().references('builds.id').onUpdate('CASCADE').onDelete('CASCADE');
      t.integer('number').notNullable();
      t.json('content').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
      t.primary(['buildId', 'number']);
    })

    .raw(
`
CREATE FUNCTION build_change_notify() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('build:' || NEW.id, '{"table":"builds","where":{"id":' || NEW.id || '}}');
  PERFORM pg_notify('env:' || NEW."envId" || ':build', '{"table":"builds","where":{"id":' || NEW.id || '}}');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER build_change_trigger AFTER INSERT OR UPDATE ON builds
FOR EACH ROW EXECUTE PROCEDURE build_change_notify();

CREATE FUNCTION log_line_change_notify() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('build:' || NEW."buildId" || ':logLine', '{"table":"logLines","where":{"buildId":' || NEW."buildId" || ',"number":' || NEW.number || '}}');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_line_change_trigger AFTER INSERT OR UPDATE ON "logLines"
FOR EACH ROW EXECUTE PROCEDURE log_line_change_notify();
`
    );

exports.down = ({schema}) =>
  schema
    .raw(
`
DROP TRIGGER log_line_change_trigger ON "logLines";
DROP FUNCTION log_line_change_notify();
DROP TRIGGER build_change_trigger ON builds;
DROP FUNCTION build_change_notify();
`
    )
    .dropTable('logLines')
    .dropTable('builds')
    .dropTable('permissions')
    .dropTable('envs');
