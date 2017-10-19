exports.dependencies = [require('./env')];

exports.typeDefs = `
type Permission {
  envId: ID!
  env: Env!
  userId: ID!
  role: String!
  createdAt: String!
  updatedAt: String!
}
`;
