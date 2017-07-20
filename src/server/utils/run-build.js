const _ = require('underscore');
const {CANCELLED} = require('../../shared/constants/statuses');
const getDbListener = require('./get-db-listener');
const {fork} = require('child_process');

module.exports = ({buildId}) =>
  new Promise(resolve => {
    const worker = fork('src/server/worker', {
      env: _.extend(process.env, {WORKER_BUILD_ID: buildId})
    });
    const listener = getDbListener({
      filter: ({_type, id}) => _type === 'build' && id === buildId,
      onChange: ({status}) => {
        if (status === CANCELLED) worker.kill();
      }
    });
    worker.on('exit', () => {
      console.log('worker exit');
      listener.destroy();
      resolve();
    });
  });
