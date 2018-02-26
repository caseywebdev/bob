const {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');
const GraphQLJSON = require('graphql-type-json');

module.exports = new GraphQLObjectType({
  name: 'Build',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID)},
    env: require('./env'),
    envId: {type: new GraphQLNonNull(GraphQLID)},
    sourceId: {type: new GraphQLNonNull(GraphQLID)},
    buildArgs: {type: GraphQLJSON},
    message: {type: new GraphQLNonNull(GraphQLString)},
    context: {type: GraphQLString},
    dockerfile: {type: GraphQLString},
    ref: {type: new GraphQLNonNull(GraphQLString)},
    repo: {type: new GraphQLNonNull(GraphQLString)},
    sha: {type: new GraphQLNonNull(GraphQLString)},
    tags: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
    status: {type: new GraphQLNonNull(require('../build-status'))},
    output: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))},
    error: {type: GraphQLString},
    meta: {type: GraphQLJSON},
    createdAt: {type: new GraphQLNonNull(GraphQLString)},
    updatedAt: {type: new GraphQLNonNull(GraphQLString)}
  })
});
