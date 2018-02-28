const getDb = require('../../functions/get-db');

module.exports = {
  type: require('../env'),
  resolve: async ({envId}) => (await getDb())('envs').where({id: envId})
};
