const {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');
const GraphQLJSON = require('graphql-type-json');

module.exports = new GraphQLObjectType({
  name: 'Build',
  fields: () => ({
    id: {type: new GraphQLNonNull(require('../uuid'))},
    env: require('./env'),
    sourceId: {type: new GraphQLNonNull(require('../source-id'))},
    buildArgs: {type: GraphQLJSON},
    message: {type: new GraphQLNonNull(GraphQLString)},
    context: {type: GraphQLString},
    dockerfile: {type: GraphQLString},
    ref: {type: new GraphQLNonNull(GraphQLString)},
    repo: {type: new GraphQLNonNull(GraphQLString)},
    hash: {type: new GraphQLNonNull(GraphQLString)},
    tags: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
    status: {type: new GraphQLNonNull(require('../build-status'))},
    output: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
    error: {type: GraphQLString},
    meta: {type: GraphQLJSON},
    createdAt: {type: new GraphQLNonNull(require('../datetime'))},
    updatedAt: {type: new GraphQLNonNull(require('../datetime'))}
  })
});
