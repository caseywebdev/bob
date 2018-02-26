const {GraphQLString} = require('graphql');

module.exports = {
  args: {
    say: {type: GraphQLString}
  },
  type: GraphQLString,
  resolve: (__, {say}) => say
};
