const {vault} = require('../config');
const FortKnox = require('fort-knox');

module.exports = new FortKnox(vault);
