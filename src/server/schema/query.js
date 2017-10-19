exports.dependencies = [
  require('./build'),
  require('./json')
];

exports.typeDefs = `
type Query {
  build(test: JSON): Build
  builds: [Build]
  echo(say: String!): String
}
`;

exports.resolvers = {
  Query: {
    build: () => ({status: 'pending', buildArgs: {foo: 'bar'}, id: 'foo'}),
    builds: () => [{id: 'foo'}],
    echo: (__, {say}) => say
  }
};
