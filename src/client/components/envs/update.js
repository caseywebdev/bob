import {withPave} from 'pave-react';
import React from 'react';

const render = ({props: {pave: {state: {env}}}}) =>
  <div>
    <div>Update {env && env.name}</div>
    <div>Name</div>
    <pre>
      {JSON.stringify(env && env.name, null, 2)}
    </pre>
    <div>Config</div>
    <pre>
      {JSON.stringify(env && env.config, null, 2)}
    </pre>
    <div>Permissions</div>
    <pre>
      {JSON.stringify(env && env.permissions, null, 2)}
    </pre>
  </div>;

export default withPave(
  props => render({props}),
  {
    getQuery: ({props: {match: {params: {id}}}}) =>
      ['envsById', id, [[], 'permissions']],

    getState: ({props: {match: {params: {id}}}, store}) => ({
      env: store.get(['envsById', id])
    })
  }
);
