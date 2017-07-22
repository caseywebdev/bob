const {ADMIN, READ, WRITE} = require('./permission-levels');

module.exports = {
  ADMIN: ADMIN + READ + WRITE,
  READ,
  WRITE: READ + WRITE,
  NONE: 0
};
