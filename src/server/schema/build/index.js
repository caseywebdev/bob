const {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');
const GraphQLTypeJSON = require('graphql-type-json');

module.exports = new GraphQLObjectType({
  name: 'Build',
  fields: () => ({
    id: {type: GraphQLNonNull(GraphQLID)},
    env: require('./env'),
    envId: {type: GraphQLNonNull(GraphQLID)},
    sourceId: {type: GraphQLNonNull(GraphQLID)},
    buildArgs: {type: GraphQLTypeJSON},
    message: {type: GraphQLNonNull(GraphQLString)},
    context: {type: GraphQLString},
    dockerfile: {type: GraphQLString},
    ref: {type: GraphQLNonNull(GraphQLString)},
    repo: {type: GraphQLNonNull(GraphQLString)},
    sha: {type: GraphQLNonNull(GraphQLString)},
    tags: {type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLString)))},
    status: {type: GraphQLNonNull(require('../build-status'))},
    output: {type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLString)))},
    error: {type: GraphQLString},
    meta: {type: GraphQLTypeJSON},
    createdAt: {type: GraphQLNonNull(GraphQLString)},
    updatedAt: {type: GraphQLNonNull(GraphQLString)}
  })
});
