const _ = require('underscore');
const ensure = require('./ensure');
const getDb = require('./get-db');
const loop = require('./loop');

const getRecord = async ({_type, id, buildId, number}) => {
  const db = await getDb();
  switch (_type) {
  case 'build':
    return (await db('builds').select().where({id}))[0];
  case 'logLine':
    return (await db('logLines').select().where({buildId, number}))[0];
  }
};

const handleNotifiation = async ({payload}) => {
  payload = JSON.parse(payload);
  let record;
  for (let {filter, onChange} of listeners) {
    if (!filter(payload)) continue;
    if (!record) record = await getRecord(payload);
    onChange(record);
  }
};

const startListening = () =>
  new Promise(async resolve => {
    const db = await getDb();
    const conn = await db.client.acquireRawConnection();
    conn.on('notification', handleNotifiation);
    await conn.query('LISTEN "change"');
    conn.on('end', resolve);
  });

loop(() => ensure(startListening));

let listeners = [];

module.exports = ({filter, onChange}) => {
  const listener = {filter, onChange};
  listener.destroy = () => listeners = _.without(listeners, listener);
  listeners.push(listener);
  return listener;
};
