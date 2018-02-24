const {GraphQLString} = require('graphql');

module.exports = {
  type: GraphQLString,
  args: {
    say: {type: GraphQLString}
  },
  resolve: (__, {say}) => say
};
