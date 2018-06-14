const {GraphQLNonNull, GraphQLString} = require('graphql');
const getDb = require('../../functions/get-db');
const pubsub = require('../../constants/pubsub');

module.exports = {
  args: {
    id: {type: new GraphQLNonNull(require('../uuid'))}
  },
  type: GraphQLString,
  subscribe: async (obj, {id}) => {
    const channel = `emailAddressClaim:${id}:verified`;
    const it = pubsub.asyncIterator(channel);
    const db = await getDb();
    const eac = await db('emailAddressClaims').where({id}).first();
    if (eac && eac.verifiedAt) {
      await pubsub.publish(channel, {emailAddressClaimVerified: true});
    }
    return it;
  }
};
