import {withPave} from 'pave-react';
import React from 'react';
import Header from '../shared/header';
import Meta from '../shared/meta';
import Editor from './editor';

const render = ({
  props: {match: {params: {id}}, pave: {state: {env}, store}}
}) =>
  <Meta title={`Update ${env && env.name || ''}`}>
    <div>
      <Header>Update Env</Header>
      <Editor
        envId={id}
        onSave={env =>
          store.run({query: ['updateEnv!', env]})
            .then(() => alert('Env updated!'))
            .catch(er => alert(er))
        }
      />
    </div>
  </Meta>;

export default withPave(
  props => render({props}),
  {
    getQuery: ({props: {match: {params: {id}}}}) =>
      ['envsById', id],

    getState: ({props: {match: {params: {id}}}, store}) => ({
      env: store.get(['envsById', id])
    })
  }
);
