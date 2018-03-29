const hasPermission = require('./has-permission');
const {READ_USER, WRITE_USER, READ_USER_TOKEN} = require('../constants/roles');

test('allows the 0 permission all rights', () => {
  expect(hasPermission(READ_USER, 0)).toBe(true);
  expect(hasPermission(READ_USER | WRITE_USER, 0)).toBe(true);
});

test('disallows insufficient permissions', () => {
  expect(hasPermission(READ_USER, WRITE_USER)).toBe(false);
  expect(hasPermission(READ_USER | WRITE_USER, READ_USER)).toBe(false);
  expect(hasPermission(READ_USER | WRITE_USER, WRITE_USER)).toBe(false);
});

test('allows exact permissions', () => {
  expect(hasPermission(READ_USER | WRITE_USER, READ_USER | WRITE_USER))
    .toBe(true);
});

test('allows extra permissions', () => {
  expect(
    hasPermission(
      READ_USER | WRITE_USER,
      READ_USER | WRITE_USER | READ_USER_TOKEN
    )
  ).toBe(true);
});
