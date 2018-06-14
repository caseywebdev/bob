const {PubSub} = require('graphql-subscriptions');
const getDb = require('../functions/get-db');
const sleep = require('../functions/sleep');
const escapeSql = require('../functions/escape-sql');

const IGNORE = new Set(['newListener', 'removeListener']);

class PostgresPubSub extends PubSub {
  constructor(...args) {
    super(...args);
    this.ee
      .on('newListener', (...args) => this.handleNewListener(...args))
      .on('removeListener', (...args) => this.handleRemoveListener(...args));
  }

  async publish(channel, payload) {

    // Escape channel (identifier) and payload (string < 8000 bytes).
    const sql = escapeSql(
      'NOTIFY :channel:, :payload',
      {channel, payload: JSON.stringify(payload) || 'null'}
    );

    // Prefer sending the NOTIFY on the LISTEN connection if available. This
    // will ensure that subscribing and then publishing in the same thread will
    // result in the message always being heard. If there isn't a LISTEN
    // connection established, then nothing is subscribed so it's safe to use
    // the pool.
    if (this.connection) {
      const connection = await this.connection;
      await connection.query(sql);
    } else {
      const db = await getDb();
      await db.raw(sql);
    }

    return true;
  }

  async createConnection() {
    while (true) {
      try {
        const db = await getDb();
        const connection = await db.client.acquireRawConnection();
        connection
          .on('notification', (...args) => this.handleNotification(...args))
          .on('end', async () => this.handleEnd(connection));

        for (let channel in this.getChannels()) {
          await connection.query(escapeSql('LISTEN :channel:', {channel}));
        }

        return connection;
      } catch (er) {
        console.error(er);
        await sleep(10);
      }
    }
  }

  async getConnection() {
    return await (
      this.connection || (this.connection = this.createConnection())
    );
  }

  async handleEnd(_connection) {
    const connection = await this.connection;
    if (connection === _connection) this.connection = null;
    if (this.getChannels().length) await this.getConnection();
  }

  async handleNewListener(channel) {
    try {
      if (IGNORE.has(channel) || this.ee.listenerCount(channel)) return;

      const connection = await this.getConnection();
      await connection.query(escapeSql('LISTEN :channel:', {channel}));
    } catch (er) {
      console.error(er);
    }
  }

  async handleRemoveListener(channel) {
    try {
      if (IGNORE.has(channel) || this.ee.listenerCount(channel)) return;

      const connection = await this.getConnection();
      if (!this.getChannels().length) {
        this.connection = null;
        await connection.end();
      } else {
        await connection.query(escapeSql('UNLISTEN :channel:', {channel}));
      }
    } catch (er) {
      console.error(er);
    }
  }

  getChannels() {
    return this.ee.eventNames().filter(channel => !IGNORE.has(channel));
  }

  handleNotification({channel, payload}) {
    this.ee.emit(channel, JSON.parse(payload));
  }
}

module.exports = new PostgresPubSub();
