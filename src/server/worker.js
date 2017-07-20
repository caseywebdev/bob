(async () => {
  try {
    const config = require('./config');
    const runBuildWorker = require('./utils/run-build-worker');

    await runBuildWorker({buildId: config.worker.buildId});
    process.exit();
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
