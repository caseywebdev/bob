const _ = require('underscore');
const {GraphQLInt, GraphQLString} = require('graphql');
const getHash = require('../../functions/get-hash');
const qs = require('querystring');

module.exports = {
  args: {size: {type: GraphQLInt}},
  type: GraphQLString,
  resolve: async ({id}, {size}, {loaders}) => {
    const userEmailAddresses = await loaders.userEmailAddressesByUser.load(id);
    const [{emailAddress} = {}] = userEmailAddresses;
    const hash = getHash({algorithm: 'md5', buffer: emailAddress});
    const hex = hash.toString('hex');
    const query = qs.stringify(_.pick({s: size, d: 'retro'}, _.identity));
    return `https://secure.gravatar.com/avatar/${hex}?${query}`;
  }
};
