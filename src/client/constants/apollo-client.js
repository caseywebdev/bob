import {ApolloClient} from 'apollo-client';
import {ApolloLink} from 'apollo-link';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ErrorLink} from 'apollo-link-error';
import disk from './disk';
import errors from '../../shared/constants/errors';
import updateToken from '../functions/update-token';

const cache = new InMemoryCache();

const {INVALID_TOKEN} = errors;

const errorLink = new ErrorLink(({networkError: {bodyText} = {}}) => {
  if (bodyText === INVALID_TOKEN.message) updateToken();
});

const authLink = new ApolloLink((operation, forward) => {
  const token = disk.get('token');
  if (token) {
    operation.setContext({headers: {Authorization: `Bearer ${token}`}});
  }
  return forward(operation);
});

const httpLink = new HttpLink({uri: '/api/graphql'});

const link = ApolloLink.from([errorLink, authLink, httpLink]);

export default new ApolloClient({cache, link});
