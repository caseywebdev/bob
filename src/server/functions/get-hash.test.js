const getHash = require('./get-hash');

const buffer = 'foo';

for (let [algorithm, expected] of Object.entries({
  md5: 'acbd18db4cc2f85cedef654fccc4a4d8',
  sha1: '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33',
  sha256: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
  sha512: 'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7'
})) {
  test(`creates a token and matching hash (${algorithm})`, () => {
    expect(getHash({algorithm, buffer})).toEqual(Buffer.from(expected, 'hex'));
  });
}
