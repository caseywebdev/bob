const Env = require('../env');
const getDb = require('../../functions/get-db');

module.exports = {
  type: Env,
  resolve: async ({envId}) => (await getDb())('envs').where({id: envId})
};
