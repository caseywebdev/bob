const _ = require('underscore');
const {Writable} = require('stream');
const getDb = require('./get-db');

module.exports = class extends Writable {
  constructor({buildId}) {
    super({objectMode: true});
    this.buildId = buildId;
    this.idCursor = -1;
    this.logLines = [];
    this.errorLogged = false;
  }

  async _write(content, __, cb) {
    try {
      const {idCursor, logLines} = this;
      const {id} = content;
      if (id) {
        const index = _.findLastIndex(logLines, ({content: {id: _id}}) =>
          _id === id
        );
        if (index > idCursor) {
          await this.updateLogLine({content, index});
          return cb();
        }
      }

      await this.createLogLine({content});
      cb();
    } catch (er) {
      if (!this.errorLogged) {
        console.error(er);
        this.errorLogged = true;
      }
      cb();
    }
  }

  async createLogLine({content}) {
    const {buildId, logLines, logLines: {index}} = this;
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
  }
};
