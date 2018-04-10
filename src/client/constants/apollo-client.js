import {ApolloClient} from 'apollo-client';
import {ApolloLink} from 'apollo-link';
import {createHttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import disk from './disk';

const cache = new InMemoryCache();

const authLink = new ApolloLink((operation, forward) => {
  const token = disk.get('token');
  if (token) {
    operation.setContext({headers: {Authorization: `Bearer ${token}`}});
  }
  return forward(operation);
});

const httpLink = createHttpLink({uri: '/api/graphql'});

const link = ApolloLink.from([authLink, httpLink]);

export default new ApolloClient({cache, link});
