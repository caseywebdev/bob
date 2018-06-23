module.exports = {
  ALL: Math.pow(2, 31) - 1,
  READ_USER: 1 << 0,
  WRITE_USER: 1 << 1,
  READ_ENV: 1 << 2,
  WRITE_ENV: 1 << 3,
  READ_USER_TOKEN: 1 << 4,
  WRITE_USER_TOKEN: 1 << 5,
  READ_BUILD: 1 << 6
};
