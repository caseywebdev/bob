const bcrypt = require('bcrypt');
const config = require('../config');

const {tokenSaltRounds} = config;

module.exports = async ({token}) => await bcrypt.hash(token, tokenSaltRounds);
