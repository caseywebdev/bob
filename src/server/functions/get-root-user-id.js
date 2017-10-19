const config = require('../config');
const getValue = require('./get-value');
const memoize = require('./memoize');

const {rootUserId} = config;

module.exports = memoize(async () => getValue({value: rootUserId}));
