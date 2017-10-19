exports.dependencies = [
  require('./json'),
  require('./permission')
];

exports.typeDefs = `
type Env {
  id: ID!
  name: String!
  config: JSON!
  permissions: [Permission!]!
  createdAt: String!
  updatedAt: String!
}
`;
