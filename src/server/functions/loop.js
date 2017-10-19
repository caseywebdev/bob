const loop = module.exports = async fn => {
  await fn();
  return loop(fn);
};
