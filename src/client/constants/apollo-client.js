import {ApolloClient, createNetworkInterface} from 'react-apollo';

export default new ApolloClient({
  networkInterface: createNetworkInterface({uri: '/api/graphql'})
});
