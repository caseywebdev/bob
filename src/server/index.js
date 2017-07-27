(async () => {
  try {
    await require('./initializers/migrate')();
    await require('./initializers/poll-for-work')();
    await require('./initializers/http')();
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
