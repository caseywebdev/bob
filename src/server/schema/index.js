const {makeExecutableSchema} = require('graphql-tools');

const merge = (a, b) => {
  for (let key in b) {
    if (a[key]) merge(a[key], b[key]);
    else a[key] = b[key];
  }
};

const reduce = (
  node,
  result = {typeDefs: [], resolvers: []},
  seen = new Set()
) => {
  if (seen.has(node)) return result;

  seen.add(node);
  result.typeDefs.push(node.typeDefs || '');
  merge(result.resolvers, node.resolvers);
  (node.dependencies || []).forEach(node => reduce(node, result, seen));
  return result;
};

module.exports = makeExecutableSchema(reduce(require('./schema')));
