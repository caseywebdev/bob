const {PubSub} = require('graphql-subscriptions');
const getDb = require('../functions/get-db');
const sleep = require('../functions/sleep');

const IGNORE = new Set(['newListener', 'removeListener']);

class PostgresPubSub extends PubSub {
  constructor(...args) {
    super(...args);
    this.ee
      .on('newListener', (...args) => this.handleNewListener(...args))
      .on('removeListener', (...args) => this.handleRemoveListener(...args));
  }

  async publish(channel, payload) {
    const db = await getDb();
    await db.raw(db.raw(
      'NOTIFY :channel:, :payload',
      {channel, payload: JSON.stringify(payload) || 'null'}
    ).toQuery());
    return true;
  }

  async getConnection() {
    if (this.connection) return await this.connection;

    let resolve;
    this.connection = new Promise(_resolve => resolve = _resolve);

    while (true) {
      try {
        const db = await getDb();
        const connection = await db.client.acquireRawConnection();
        connection
          .on('notification', (...args) => this.handleNotification(...args))
          .on('end', async () => this.handleEnd(connection));

        for (let channel in this.getChannels()) {
          await connection.query(`LISTEN "${channel}"`);
        }

        this.connection = connection;
        resolve(connection);
        return connection;
      } catch (er) {
        console.error(er);
        await sleep(10);
      }
    }
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
      await connection.query(`LISTEN "${channel}"`);
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
      } else await connection.query(`UNLISTEN "${channel}"`);
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
