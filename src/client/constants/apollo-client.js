import {ApolloClient} from 'apollo-client';
import {ApolloLink} from 'apollo-link';
import {createHttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {withClientState} from 'apollo-link-state';
import disk from './disk';

const cache = new InMemoryCache();

const stateLink = withClientState({
  cache,
  resolvers: {
    Query: {
      token: () => disk.get('token') || null
    },
    Mutation: {
      updateToken: (__, {token}, {cache}) => {
        disk.set('token', token);
        cache.writeData({data: {token}});
      }
    }
  }
});

const authLink = new ApolloLink((operation, forward) => {
  const token = disk.get('token');
  if (token) {
    operation.setContext({headers: {Authorization: `Bearer ${token}`}});
  }
  return forward(operation);
});

const httpLink = createHttpLink({uri: '/api/graphql'});

const link = ApolloLink.from([stateLink, authLink, httpLink]);

export default new ApolloClient({cache, link});
