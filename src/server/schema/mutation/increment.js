const {GraphQLInt} = require('graphql');

let n = 0;
module.exports = {
  type: GraphQLInt,
  args: {by: {type: GraphQLInt}},
  resolve: (__, {by = 1}) => n += by
};
