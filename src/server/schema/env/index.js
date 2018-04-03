const {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');
const GraphQLJSON = require('graphql-type-json');

module.exports = new GraphQLObjectType({
  name: 'Env',
  fields: () => ({
    config: {type: new GraphQLNonNull(GraphQLJSON)},
    createdAt: {type: new GraphQLNonNull(require('../datetime'))},
    id: {type: new GraphQLNonNull(GraphQLID)},
    name: {type: new GraphQLNonNull(GraphQLString)},
    permissions: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(require('../permission'))))},
    updatedAt: {type: new GraphQLNonNull(require('../datetime'))}
  })
});
