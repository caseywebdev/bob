const {GraphQLID} = require('graphql');
const Build = require('../build');
const getDb = require('../../functions/get-db');

module.exports = {
  args: {
    id: {type: GraphQLID}
  },
  type: Build,
  resolve: async (__, {id}) => {
    const db = await getDb();
    const [build] = await db('builds').where({id});
    if (!build) throw new Error(`Build ${id} not found`);

    return build;
  }
};
