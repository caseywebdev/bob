exports.typeDefs = `
type Mutation {
  increment(by: Int): Int!
}
`;

let n = 0;
exports.resolvers = {
  Mutation: {
    increment: (__, {by = 1}) => n += by
  }
};
