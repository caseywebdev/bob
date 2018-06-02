import apolloClient, {wsLink} from '../constants/apollo-client';
import disk from '../constants/disk';

export default token => {
  if (token) {
    disk.set('token', token);
  } else {
    disk.remove('token');
  }
  apolloClient.cache.reset();
  if (wsLink.client) wsLink.client.close();
  window.postMessage({name: 'token-updated'}, location.origin);
};
