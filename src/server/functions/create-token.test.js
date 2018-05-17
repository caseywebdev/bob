const createToken = require('./create-token');
const getHash = require('./get-hash');
const uuid = require('uuid/v4');

test('creates a unique token and matching hash', async () => {
  const id = uuid();
  const {token, tokenHash, tokenHashAlgorithm} = await createToken({id});
  expect(tokenHash)
    .toEqual(getHash({algorithm: tokenHashAlgorithm, buffer: token}));
  expect(token).not.toEqual(await createToken({id}));
});
