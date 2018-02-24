const {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');
const GraphQLTypeJSON = require('graphql-type-json');

module.exports = new GraphQLObjectType({
  name: 'Env',
  fields: () => ({
    config: {type: GraphQLNonNull(GraphQLTypeJSON)},
    createdAt: {type: GraphQLNonNull(GraphQLString)},
    id: {type: GraphQLNonNull(GraphQLID)},
    name: {type: GraphQLNonNull(GraphQLString)},
    permissions: {type: GraphQLNonNull(GraphQLList(GraphQLNonNull(require('../permission'))))},
    updatedAt: {type: GraphQLNonNull(GraphQLString)}
  })
});
