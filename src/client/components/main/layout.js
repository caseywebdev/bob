import {withPave} from 'pave-react';
import config from '../../config';
import React from 'react';

const render = ({props: {pave: {state: {user}}}}) =>
  <div>
    Foo
    <a href={`http://github.com/login/oauth/authorize?client_id=${config.github.clientId}`}>Sign In</a>
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
