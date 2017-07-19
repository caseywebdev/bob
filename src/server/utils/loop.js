const ensure = require('./ensure');

const loop = module.exports = async fn => {
  await ensure(fn);
  return loop(fn);
};
