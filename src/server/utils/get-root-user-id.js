const config = require('../config');
const vault = require('./root-vault');

const {rootUserId: {value, vault: {path, key}}} = config;

module.exports = async () => value || (await vault.get(path))[key];
