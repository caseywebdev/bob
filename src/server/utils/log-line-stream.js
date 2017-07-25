const _ = require('underscore');
const {Writable} = require('stream');
const getDb = require('./get-db');
const notify = require('./notify');

module.exports = class extends Writable {
  constructor({buildId}) {
    super({objectMode: true});
    this.buildId = buildId;
    this.idCursor = -1;
    this.logLines = [];
    this.errorLogged = false;
    this.buffer = '';
  }

  async _write(content, __, cb) {
    try {
      const {idCursor, logLines} = this;
      const {id, stream} = content;
      if (stream == null) await this.flushBuffer();
      if (id) {
        const index = _.findLastIndex(logLines, ({content: {id: _id}}) =>
          _id === id
        );
        if (index > idCursor) {
          await this.updateLogLine({content, index});
        } else {
          await this.createLogLine({content});
        }
      } else if (stream) {
        this.buffer += stream;
        const lines = this.buffer.split('\n');
        this.buffer = _.last(lines);
        for (let line of _.initial(lines)) {
          await this.createLogLine({content: {stream: line}});
        }
      } else {
        await this.createLogLine({content});
      }
      cb();
    } catch (er) {
      this.handleError(er);
      cb();
    }
  }

  async _final(cb) {
    try {
      await this.flushBuffer();
      cb();
    } catch (er) {
      this.handleError(er);
      cb();
    }
  }

  async flushBuffer() {
    if (!this.buffer) return;

    const stream = this.buffer;
    this.buffer = '';
    await this.createLogLine({content: {stream}});
  }

  async handleError(er) {
    if (!this.errorLogged) {
      console.error(er);
      this.errorLogged = true;
    }
  }

  async createLogLine({content}) {
    const {buildId, logLines, logLines: {length: index}} = this;
    if (!content.id) this.idCursor = index;

    const db = await getDb();
    const [logLine] = await db('logLines')
      .insert({buildId, index, content})
      .returning('*');
    logLines.push(logLine);
  }

  async updateLogLine({content, index}) {
    const {buildId, logLines} = this;
    const db = await getDb();
    const [logLine] = await db('logLines')
      .update({content, updatedAt: new Date()})
      .where({buildId, index})
      .returning('*');
    logLines[index] = logLine;
    try {
      await notify({
        channel: `build:${buildId}:logLine`,
        data: {table: 'logLines', where: {buildId, index}}
      });
    } catch (er) {}
  }
};
