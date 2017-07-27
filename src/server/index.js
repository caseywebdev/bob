(async () => {
  try {
    await require('./initializers/migrate')();
    await require('./initializers/poll-for-work')();
    await require('./initializers/http')();
    process.on('SIGTERM', process.exit.bind(process));
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
