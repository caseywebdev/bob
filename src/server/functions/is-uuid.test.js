const isUuid = require('./is-uuid');
const uuid = require('uuid/v4');

test('returns true for valid uuids', () => {
  expect(isUuid(uuid())).toBe(true);
});

test('requires dashes', () => {
  expect(isUuid(uuid().replace(/-/g, ''))).toBe(false);
});
