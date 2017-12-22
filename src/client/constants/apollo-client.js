import {ApolloClient} from 'apollo-client';
import {ApolloLink} from 'apollo-link';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {withClientState} from 'apollo-link-state';

const cache = new InMemoryCache();

export default new ApolloClient({
  cache,
  link: new ApolloLink([
    withClientState({
      cache,
      resolvers: {
        Query: {
          clientFoo: (__, ___, {cache}) =>
            cache.writeData({data: 'bar'})
        }
      }
    }),
    new HttpLink({uri: '/api/graphql'})
  ])
});
