const path = require('path');
const tar = require('tar-stream');
const {Transform} = require('stream');

module.exports = class extends Transform {
  constructor(options) {
    super(options);

    const {base = '.', strip = 0} = options || {};
    const pack = tar
      .pack()
      .on('data', data => this.push(data))
      .on('end', () => this.push(null));

    this.extract = tar
      .extract()
      .on('entry', (header, stream, cb) => {
        let {name} = header;
        if (strip) name = name.split('/').slice(strip).join('/');
        if (base) name = path.relative(base, name);

        if (name.startsWith('..')) return cb();

        header.name = name;
        stream.pipe(pack.entry(header, cb));
      })
      .on('finish', () => pack.finalize());
  }

  _transform(buffer, _, cb) {
    this.extract.write(buffer);
    cb();
  }

  _final(cb) {
    this.extract.end(cb);
  }
};
