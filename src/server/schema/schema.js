exports.dependencies = [
  require('./mutation'),
  require('./query'),
  require('./subscription')
];

exports.typeDefs = `
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`;
