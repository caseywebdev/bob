const getDb = require('../functions/get-db');

exports.dependencies = [
  require('./build'),
  require('./json')
];

exports.typeDefs = `
type Query {
  build(id: ID!): Build
  builds: [Build]
  echo(say: String!): String
}
`;

exports.resolvers = {
  Query: {
    build: async (__, {id}) => {
      const db = await getDb();
      const [build] = await db('builds').where({id});
      if (!build) throw new Error(`Build ${id} not found`);

      return build;
    },
    builds: async () => (await getDb())('builds'),
    echo: (__, {say}) => say
  }
};
