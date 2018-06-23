const hasPermission = require('./has-permission');
const roles = require('../constants/roles');

const {ALL, READ_USER, WRITE_USER, READ_USER_TOKEN} = roles;

test('ALL role has permission for every role', () => {
  for (const roleName in roles) {
    expect(hasPermission(ALL, roles[roleName])).toBe(true);
  }
});

test('disallows insufficient permissions', () => {
  expect(hasPermission(WRITE_USER, READ_USER)).toBe(false);
  expect(hasPermission(READ_USER, READ_USER | WRITE_USER)).toBe(false);
  expect(hasPermission(WRITE_USER, READ_USER | WRITE_USER)).toBe(false);
});

test('allows exact permissions', () => {
  expect(hasPermission(READ_USER | WRITE_USER, READ_USER | WRITE_USER))
    .toBe(true);
});

test('allows extra permissions', () => {
  expect(
    hasPermission(
      READ_USER | WRITE_USER | READ_USER_TOKEN,
      READ_USER | WRITE_USER
    )
  ).toBe(true);
});
