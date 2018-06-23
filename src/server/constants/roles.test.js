const _ = require('underscore');
const roles = require('./roles');

test('role values are unique', () => {
  expect(Object.keys(roles)).toHaveLength(Object.keys(_.invert(roles)).length);
});

test('role values are natrual numbers', () => {
  Object.values(roles).forEach(role => {
    expect(role).toBeGreaterThan(0);
    expect(role).toEqual(parseInt(role));
  });
});
