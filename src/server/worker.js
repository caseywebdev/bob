(async () => {
  try {
    const {listen} = require('./functions/db-channels');
    const {worker: {buildId}} = require('./config');
    const runBuildWorker = require('./functions/run-build-worker');

    await listen(`build:${buildId}:cancelled`, () => process.exit());
    await runBuildWorker({buildId});
    process.exit();
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
