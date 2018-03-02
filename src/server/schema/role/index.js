const {GraphQLEnumType} = require('graphql');

module.exports = new GraphQLEnumType({
  name: 'Role',
  description: 'Possible roles.',
  values: {
    READ_ACCOUNT: {value: 1 << 0},
    WRITE_ACCOUNT: {value: 1 << 1},
    READ_ENVS: {value: 1 << 2},
    WRITE_ENVS: {value: 1 << 3}
  }
});
