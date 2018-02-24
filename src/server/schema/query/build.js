const {GraphQLID} = require('graphql');
const Build = require('../build');
const getDb = require('../../functions/get-db');

module.exports = {
  type: Build,
  args: {
    id: {type: GraphQLID}
  },
  resolve: async (__, {id}) => {
    const db = await getDb();
    const [build] = await db('builds').where({id});
    if (!build) throw new Error(`Build ${id} not found`);

    return build;
  }
};
