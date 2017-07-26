const _ = require('underscore');
const {Writable} = require('stream');
const getDb = require('./get-db');

const SAVE_INTERVAL = 1000;

const handleChunk = ({chunk: {id, progress, status, stream}, chunks}) => {
  let text = _.compact([id, status, progress, stream]).join(' ');
  if (!text) return;

  if (id) {
    const index = _.findLastIndex(chunks, {id});
    const minIndex = _.findLastIndex(chunks, ({id}) => !id);
    if (index > minIndex) return chunks[index] = {id, text};

    return chunks.push({id, text});
  }

  if (text === status) return chunks.push({status: true, text});

  const last = _.last(chunks);
  if (!last || last.id || last.status) return chunks.push({text});

  last.text += text;
};

module.exports = class extends Writable {
  constructor({buildId}) {
    super({objectMode: true});
    this.buildId = buildId;
    this.chunks = [];
    this.lastOutput = '';
    this.save = this.save.bind(this);
    this.save();
  }

  _write(chunk, __, cb) {
    handleChunk({chunk, chunks: this.chunks});
    cb();
  }

  async _final(cb) {
    await this.save(true);
    cb();
  }

  async save(final) {
    const {buildId: id, chunks, saveIntervalId} = this;
    clearTimeout(saveIntervalId);
    const output = _.map(chunks, ({text}) => text.trim()).join('\n');
    if (output !== this.lastOutput) {
      try {
        const db = await getDb();
        await db('builds').update({output, updatedAt: new Date()}).where({id});
        this.lastOutput = output;
      } catch (er) {
        console.error(er);
      }
    }
    if (!final) this.saveIntervalId = setInterval(this.save, SAVE_INTERVAL);
  }
};
