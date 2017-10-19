module.exports = fn => {
  let promise;
  return (...args) =>
    promise || (promise = (async () => {
      try {
        return await fn(...args);
      } catch (er) {
        promise = null;
        throw er;
      }
    })());
};
