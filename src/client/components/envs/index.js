import _ from 'underscore';
import {Link} from 'react-router-dom';
import {withPave} from 'pave-react';
import React from 'react';

const renderEnv = ({env: {id, name, role}}) =>
  <div key={id}>
    <div>{name}</div>
    <div><Link to={`/envs/${id}/update`}>Edit</Link></div>
    Role: {role}
  </div>;

const render = ({props: {pave: {state: {envs}}}}) =>
  <div>
    <div>Environments</div>
    <pre>
      {_.map(envs, env => renderEnv({env}))}
    </pre>
  </div>;

export default withPave(
  props => render({props}),
  {
    getQuery: () => ['envs'],

    getState: ({store}) => ({
      envs: store.get(['envs'])
    })
  }
);
