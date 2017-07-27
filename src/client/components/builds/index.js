import _ from 'underscore';
import {Link} from 'react-router-dom';
import {withPave} from 'pave-react';
import React from 'react';
import styles from './read.scss';
import history from '../../utils/history';
import SubHeader from '../shared/sub-header';

const rebuild = ({build: {id}, props: {pave: {store}}}) => {
  const cid = _.uniqueId();
  store.run({query: ['rebuild!', {cid, id}]})
    .then(() => {
      store.update({builds: {$unset: true}});
      const {id} = store.get(['buildsByCid', cid]);
      history.push(`/builds/${id}`);
    })
    .catch(::console.error);
};

const renderBuild = ({build, build: {id, repo, ref}, props}) =>
  <div className={styles.build} key={id}>
    <Link to={`/builds/${id}`}>
      <SubHeader>#{id} {repo}#{ref}</SubHeader>
    </Link>
    <button onClick={() => rebuild({build, props})}>Rebuild</button>
  </div>;

const render = ({props, props: {pave: {state: {builds}}}}) =>
  <div className={styles.root}>
    {_.map(builds, build => renderBuild({build, props}))}
  </div>;

export default withPave(
  props => render({props}),
  {
    getQuery: () => ['builds'],

    getState: ({store}) => ({
      builds: _.sortBy(store.get(['builds']), 'id').reverse()
    })
  }
);
