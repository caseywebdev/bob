const _ = require('underscore');
const {CANCELLED, FAILED, SUCCEEDED} = require('../../shared/constants/statuses');
const {fork} = require('child_process');
const {listen, unlisten} = require('./db-channels');
const updateBuildStatus = require('./update-build-status');

module.exports = async ({buildId}) => {
  let worker;
  const env = _.extend(process.env, {WORKER_BUILD_ID: buildId});
  const channel = `build:${buildId}`;
  const cb = async ({status}) => {
    if (status !== CANCELLED || !worker) return;

    worker.kill();
    worker = null;
  };

  await listen(channel, cb);
  try {
    await new Promise(resolve =>
      worker = fork('src/server/worker', {env}).on('exit', async code => {
        if (code !== 0) {
          try {
            updateBuildStatus({
              buildId,
              error: `Build worker returned a non-zero code: ${code}`,
              status: FAILED,
              unless: [CANCELLED, FAILED, SUCCEEDED]
            });
          } catch (er) {
            console.error(er);
          }
          resolve();
        }
      })
    );
  } finally {
    await unlisten(channel, cb);
  }
};
