import _ from 'underscore';
import {Link} from 'react-router-dom';
import {withPave} from 'pave-react';
import {WRITE} from '../../../shared/constants/permission-levels';
import buildIsDone from '../../utils/build-is-done';
import ErrorComponent from '../shared/error';
import getBuildDescription from '../../../shared/utils/get-build-description';
import history from '../../utils/history';
import Icon from '../shared/icon';
import React, {Component} from 'react';
import STATUS_INFO from '../../../shared/constants/status-info';
import styles from './description.scss';

const REFRESH_INTERVAL = 1000;

const rebuild = ({props: {pave: {state: {build: {id}}, store}}}) => {
  const cid = _.uniqueId();
  store.run({query: ['rebuild!', {cid, id}]})
    .then(() => {
      store.update({builds: {$unset: true}});
      const {id} = store.get(['buildsByCid', cid]);
      history.push(`/builds/${id}`);
    })
    .catch(::console.error);
};

const cancel = ({props: {pave: {state: {build: {id}}, store}}}) =>
  store.run({query: ['cancelBuild!', id]}).catch(::console.error);

const render = ({
  props,
  props: {pave: {state: {build, build: {error, id, status, tags}}}}
}) =>
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
        !(build.role & WRITE) ? null :
        buildIsDone({build}) ?
        <span className={styles.button} onClick={() => rebuild({props})}>
          <Icon name='repeat' /> Rebuild
        </span> :
        <span className={styles.button} onClick={() => cancel({props})}>
          <Icon name='ban' /> Cancel
        </span>
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

export default withPave(
  class extends Component {
    componentWillMount() {
      this.reload();
    }

    componentWillUnmount() {
      this.cancelReload();
    }

    cancelReload() {
      clearTimeout(this.reloadTimeoutId);
    }

    delayReload() {
      this.cancelReload();
      this.reloadTimeoutId = setTimeout(this.reload, REFRESH_INTERVAL);
    }

    reload = () => {
      const {pave: {state: {build}, store}, withOutput} = this.props;
      if (!build) return this.delayReload();

      if (buildIsDone({build})) return;

      const {id, output, updatedAt} = build;
      const lastOutputAt =
        withOutput ? _.max([].concat(-1, _.map(output, '0'))) : undefined;
      store.run({
        query: [
          'getBuildUpdates!',
          {id, lastOutputAt, lastUpdatedAt: updatedAt}
        ]
      })
        .catch(::console.error)
        .then(() => this.delayReload());
    }

    render() {
      return render({props: this.props});
    }
  },
  {
    getQuery: ({props: {buildId, withOutput}}) => [].concat(
      ['buildsById', buildId],
      withOutput ? [[[], ['output']]] : [],
    ),

    getState: ({props: {buildId}, store}) => ({
      build: store.get(['buildsById', buildId])
    })
  }
);
