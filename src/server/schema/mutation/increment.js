const {GraphQLInt} = require('graphql');

let n = 0;
module.exports = {
  args: {by: {type: GraphQLInt}},
  type: GraphQLInt,
  resolve: (__, {by = 1}) => n += by
};
