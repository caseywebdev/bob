import _ from 'underscore';
import {Link} from 'react-router-dom';
import {withPave} from 'pave-react';
import {WRITE} from '../../../shared/constants/permission-levels';
import buildIsDone from '../../utils/build-is-done';
import ErrorComponent from '../shared/error';
import getBuildDescription from '../../../shared/utils/get-build-description';
import history from '../../utils/history';
import React from 'react';
import STATUS_INFO from '../../../shared/constants/status-info';
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

const render = ({props, props: {build, build: {error, id, status, tags}}}) =>
  <div
    className={styles.root}
    style={{borderLeftColor: STATUS_INFO[status].color}}
  >
    <div className={styles.left}>
      {STATUS_INFO[status].emoji}
    </div>
    <div className={styles.right}>
      <Link className={styles.link} to={`/builds/${id}`}>
        {getBuildDescription({build})}
      </Link>
      {
        build.role & WRITE > 0 && buildIsDone({build}) ?
        <button onClick={() => rebuild({build, props})}>Rebuild</button> :
        <button onClick={() => cancel({build, props})}>Cancel</button>
      }
      {_.map(tags, (tag, key) =>
        <div {...{key}} className={styles.tag}>{tag}</div>)
      }
      {
        !error ? null :
        <div className={styles.error}><ErrorComponent {...{error}} /></div>
      }
    </div>
  </div>;

export default withPave(props => render({props}));
