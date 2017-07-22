import disk from '../../utils/disk';
import {withPave} from 'pave-react';
import config from '../../config';
import React from 'react';

const signOut = ({props: {pave: {store}}}) =>
  store.run({query: ['signOut!']})
    .then(() => disk.remove('auth'))
    .catch(er => console.error(er));

const render = ({props, props: {pave: {state: {user}}}}) =>
  <div>
    Foo
    <a href={`http://github.com/login/oauth/authorize?client_id=${config.github.clientId}`}>Sign In</a>
    <button onClick={() => signOut({props})}>Sign Out</button>
    <pre>{JSON.stringify(user)}</pre>
  </div>;

export default withPave(
  props => render({props}),
  {
    getQuery: () => ['user'],

    getState: ({store}) => ({
      user: store.get(['user'])
    })
  }
);
