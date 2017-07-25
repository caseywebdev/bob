import _ from 'underscore';
import {withPave} from 'pave-react';
import Editor from './editor';
import Header from '../shared/header';
import history from '../../utils/history';
import Meta from '../shared/meta';
import React from 'react';

const render = ({props: {match: {params: {id}}, pave: {store}}}) =>
  <Meta title='Create'>
    <div>
      <Header>Create Env</Header>
      <Editor
        envId={id}
        onSave={env => {
          const cid = _.uniqueId();
          store.run({query: ['createEnv!', _.extend({}, env, {cid})]})
            .then(() => {
              alert('Env created!');
              store.update({envs: {$unset: true}});
              const {id} = store.get(['envsByCid', cid]);
              history.replace(`/envs/${id}/update`);
            })
            .catch(er => alert(er));
        }}
      />
    </div>
  </Meta>;

export default withPave(props => render({props}));
