module.exports = n => {
  let cancel;
  const promise = new Promise(resolve => {
    const timeoutId = setTimeout(resolve, n * 1000);
    cancel = () => clearTimeout(timeoutId);
  });
  return {cancel, promise};
};
