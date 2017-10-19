exports.dependencies = [
  require('./build-status'),
  require('./env'),
  require('./json')
];

exports.typeDefs = `
type Build {
  id: ID!
  env: Env!
  envId: ID!
  sourceId: ID!
  buildArgs: JSON
  context: String
  dockerfile: String
  ref: String!
  repo: String!
  sha: String!
  tags: [String!]!
  status: BuildStatus!
  output: [String!]!
  error: String
  meta: JSON
  createdAt: String!
  updatedAt: String!
}
`;

exports.resolvers = {
  Build: {
    env: async () => { throw new Error('WUT'); }
  }
};
