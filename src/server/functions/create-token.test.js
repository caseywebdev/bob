const createToken = require('./create-token');
const getHash = require('./get-hash');
const isUuid = require('./is-uuid');

test('creates a unique id, token and matching hash', async () => {
  const {id, token, tokenHash, tokenHashAlgorithm} = await createToken();
  expect(isUuid(id)).toBe(true);
  expect(tokenHash)
    .toEqual(getHash({algorithm: tokenHashAlgorithm, buffer: token}));
  expect(token).not.toEqual((await createToken()).token);
});
