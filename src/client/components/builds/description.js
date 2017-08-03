import _ from 'underscore';
import {Link} from 'react-router-dom';
import {withPave} from 'pave-react';
import buildIsDone from '../../utils/build-is-done';
import getBuildDescription from '../../../shared/utils/get-build-description';
import STATUS_INFO from '../../../shared/constants/status-info';
import {WRITE} from '../../../shared/constants/permission-levels';
import history from '../../utils/history';
import React from 'react';
import styles from './description.scss';

const rebuild = ({props: {build: {id}, pave: {store}}}) => {
  const cid = _.uniqueId();
  store.run({query: ['rebuild!', {cid, id}]})
    .then(() => {
      store.update({builds: {$unset: true}});
      const {id} = store.get(['buildsByCid', cid]);
      history.push(`/builds/${id}`);
    })
    .catch(::console.error);
};

const cancel = ({props: {build: {id}, pave: {store}}}) =>
  store.run({query: ['cancelBuild!', id]}).catch(::console.error);

const render = ({props, props: {build, build: {error, id, status}}}) =>
  <div
    className={styles.root}
    style={{borderLeftColor: STATUS_INFO[status].color}}
  >
    <Link className={styles.link} to={`/builds/${id}`}>
      {getBuildDescription({build, withEmoji: true})}
    </Link>
    {
      build.role & WRITE > 0 && buildIsDone({build}) ?
      <button onClick={() => rebuild({build, props})}>Rebuild</button> :
      <button onClick={() => cancel({build, props})}>Cancel</button>
    }
    {error ? <div className={styles.error}>{error}</div> : null}
  </div>;

export default withPave(props => render({props}));
