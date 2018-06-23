const _ = require('underscore');
const {GraphQLString} = require('graphql');
const toBase64Url = require('../../functions/to-base64url');

module.exports = {
  type: GraphQLString,
  resolve: async ({loader}) => {
    const build = _.last(await loader.load('records'));
    if (!build) return;

    const {createdAt, id} = build;
    return toBase64Url(JSON.stringify({createdAt, id}));
  }
};
