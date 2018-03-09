const _ = require('underscore');
const {GraphQLList, GraphQLNonNull} = require('graphql');
const Role = require('../role');
const roles = require('../../../shared/constants/roles');

module.exports = {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Role))),
  resolve: ({roles: n}) =>
    _.reduce(roles, (roles, value, name) =>
      roles.concat(n & value ? name : [])
    , [])
};
