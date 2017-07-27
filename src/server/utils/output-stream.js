const _ = require('underscore');
const _str = require('underscore.string');
const {Writable} = require('stream');
const getDb = require('./get-db');

const SAVE_INTERVAL = 1000;

const handleChunk = ({at, chunk: {id, progress, status, stream}, lines}) => {
  if (id) {
    const text = _.compact([id, status, progress]).join(' ');
    const index = _.findLastIndex(lines, {id});
    const minIndex = _.findLastIndex(lines, ({id}) => !id);
    if (index > minIndex) return lines[index] = {at, end: true, id, text};

    return lines.push({at, end: true, id, text});
  }

  if (status) return lines.push({at, end: true, text: status});

  if (stream) {
    let text = stream;
    const last = lines.pop() || {text: ''};
    if (last.end) lines.push(last); else text = last.text + text;
    return lines.push(..._.map(_str.lines(text), text => ({at, text})));
  }
};

const formatLines = lines => {
  const cleaned = [];
  let trim = true;
  for (let i = lines.length - 1; i >= 0; --i) {
    const {at, end, text} = lines[i];
    if (!end && trim && !_str.trim(text)) continue;

    trim = !!end;
    cleaned.unshift([at, text]);
  }
  return cleaned;
};

module.exports = class extends Writable {
  constructor({buildId}) {
    super({objectMode: true});
    this.at = 0;
    this.buildId = buildId;
    this.lines = [];
    this.lastOutput = '[]';
    this.save = this.save.bind(this);
    this.save();
  }

  _write(chunk, __, cb) {
    const {at, lines} = this;
    handleChunk({at, chunk, lines});
    cb();
  }

  async _final(cb) {
    await this.save(true);
    cb();
  }

  async save(final) {
    const {buildId: id, lines, saveIntervalId} = this;
    clearTimeout(saveIntervalId);
    const output = JSON.stringify(formatLines(lines));
    if (output !== this.lastOutput) {
      try {
        ++this.at;
        const db = await getDb();
        await db('builds').update({output}).where({id});
        this.lastOutput = output;
      } catch (er) {
        console.error(er);
      }
    }
    if (!final) this.saveIntervalId = setInterval(this.save, SAVE_INTERVAL);
  }
};
