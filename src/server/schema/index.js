const {makeExecutableSchema} = require('graphql-tools');

const reduce = (
  node,
  result = {typeDefs: [], resolvers: []},
  seen = new Set()
) => {
  if (seen.has(node)) return result;

  seen.add(node);
  result.typeDefs.push(node.typeDefs || '');
  Object.assign(result.resolvers, node.resolvers);
  (node.dependencies || []).forEach(node => reduce(node, result, seen));
  return result;
};

module.exports = makeExecutableSchema(reduce(require('./schema')));
