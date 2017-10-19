const sleep = require('./sleep');

const ensure = module.exports = async fn => {
  try {
    return await fn();
  } catch (er) {
    console.error(er);
    await sleep(10000);
    return ensure(fn);
  }
};
