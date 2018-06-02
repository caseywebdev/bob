import {ApolloClient} from 'apollo-client';
import {ApolloLink, split} from 'apollo-link';
import {ErrorLink} from 'apollo-link-error';
import {getMainDefinition} from 'apollo-utilities';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {WebSocketLink} from 'apollo-link-ws';
import config from '../config';
import disk from './disk';
import errors from '../../shared/constants/errors';
import updateToken from '../functions/update-token';

const {INVALID_TOKEN} = errors;
const {apiUrl} = config.bob;

const cache = new InMemoryCache();

const getContext = () => {
  const token = disk.get('token');
  return token ? {authorization: `Bearer ${token}`} : {};
};

const errorLink = new ErrorLink(({networkError: {bodyText} = {}}) => {
  if (bodyText === INVALID_TOKEN.message) updateToken();
});

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext({headers: getContext()});
  return forward(operation);
});

const httpLink = new HttpLink({uri: `${apiUrl}/graphql`});

export const wsLink = new WebSocketLink({
  uri: `${apiUrl.replace(/^http/, 'ws')}/graphql`,
  options: {
    connectionCallback: er => {
      if (er && er.message === INVALID_TOKEN.message) updateToken();
    },
    connectionParams: getContext,
    reconnect: true
  }
});

const isSubscriptionQuery = ({query}) => {
  const {kind, operation} = getMainDefinition(query);
  return kind === 'OperationDefinition' && operation === 'subscription';
};

const link = ApolloLink.from([
  errorLink,
  split(isSubscriptionQuery, wsLink, ApolloLink.from([authLink, httpLink]))
]);

export default new ApolloClient({cache, link});
