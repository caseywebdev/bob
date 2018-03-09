const _ = require('underscore');
const {GraphQLEnumType} = require('graphql');
const roles = require('../../../shared/constants/roles');

module.exports = new GraphQLEnumType({
  name: 'Role',
  description: 'Possible roles.',
  values: _.mapObject(roles, value => ({value}))
});
