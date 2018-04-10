import apolloClient from '../constants/apollo-client';
import disk from '../constants/disk';

export default token => {
  if (token) {
    disk.set('token', token);
  } else {
    disk.remove('token');
  }
  apolloClient.cache.reset();
  window.postMessage({name: 'token-updated'}, location.origin);
};
