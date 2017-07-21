const _ = require('underscore');
const getDb = require('./get-db');

const listeners = {};

const handleNotifiation = async ({channel, payload}) => {
  const {table, where} = JSON.parse(payload);
  const db = await getDb();
  const [model] = await db(table).select().where(where);
  _.each((listeners[channel] || []).slice(), cb => cb(model));
};

let conn;
const getConn = async () => {
  if (conn) return conn;

  const db = await getDb();
  const newConn = (await db.client.acquireRawConnection())
    .on('notification', handleNotifiation)
    .on('end', async () => {
      conn = null;
      if (!_.isEmpty(listeners)) {
        try { conn = await getConn(); } catch (er) { console.error(er); }
      }
    });
  for (let channel in listeners) await newConn.query(`LISTEN "${channel}"`);
  return newConn;
};

const listen = async (channel, cb) => {
  if (listeners[channel]) return listeners[channel].push(cb);

  const conn = await getConn();
  await conn.query(`LISTEN "${channel}"`);

  if (!listeners[channel]) listeners[channel] = [];
  listeners[channel].push(cb);
};

const unlisten = async (channel, cb) => {
  if (!listeners[channel]) return;

  let rest = _.without(listeners[channel], cb);
  if (rest.length) return listeners[channel] = rest;

  delete listeners[channel];
  const conn = await getConn();
  await conn.query(`UNLISTEN "${channel}"`);
};

module.exports = {listen, unlisten};
