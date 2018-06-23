const _ = require('underscore');
const {CANCELLED, FAILED, SUCCEEDED} = require('../constants/statuses');
const {fork} = require('child_process');
const updateBuildStatus = require('./update-build-status');

module.exports = async ({buildId}) => {
  try {
    const env = _.extend(process.env, {WORKER_BUILD_ID: buildId});
    await new Promise((resolve, reject) =>
      fork('src/server/worker', {env}).on('exit', code => {
        if (code === 0) return resolve();

        reject(new Error(`Build worker returned a non-zero code: ${code}`));
      })
    );
  } catch (er) {
    try {
      await updateBuildStatus({
        buildId,
        error: `${er.message || er}`,
        status: FAILED,
        unless: [CANCELLED, FAILED, SUCCEEDED]
      });
    } catch (er) {
      console.error(er);
    }
  }
};
