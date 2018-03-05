const _ = require('underscore');
const {GraphQLEnumType} = require('graphql');
const roles = require('../../constants/roles');

module.exports = new GraphQLEnumType({
  name: 'Role',
  description: 'Possible roles.',
  values: _.mapObject(roles, value => ({value}))
});
