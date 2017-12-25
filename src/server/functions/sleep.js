const {promisify} = require('util');

const sleepInMs = promisify(setTimeout);

module.exports = async n => sleepInMs(n * 1000);
