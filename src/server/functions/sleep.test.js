const sleep = require('./sleep');

test('sleep for 0.1s', async () => {
  const start = Date.now();
  await sleep(0.1).promise;
  expect(Date.now() - start).toBeGreaterThanOrEqual(0.1 * 1000);
});

test('cancelling sleep', async () => {
  const {cancel, promise} = sleep(0.1);
  const resolve = jest.fn();
  promise.then(resolve);
  cancel();
  await sleep(0.1).promise;
  expect(resolve).not.toHaveBeenCalled();
});
