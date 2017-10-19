const GraphQLJSON = require('graphql-type-json');

exports.typeDefs = `
scalar JSON
`;

exports.resolvers = {
  JSON: GraphQLJSON
};
