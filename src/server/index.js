(async () => {
  try {
    await require('./initializers/migrate')();
    await require('./initializers/poll-for-work')();
    await require('./initializers/http')();
    await require('bcrypt').hash('test', 1);
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
