const bcrypt = require('bcrypt');
const createToken = require('./create-token');
const uuid = require('uuid/v4');

test('creates a token and matching hash', async () => {
  const {token, tokenHash} = await createToken({id: uuid()});
  expect(await bcrypt.compare(token, tokenHash)).toBe(true);
});
