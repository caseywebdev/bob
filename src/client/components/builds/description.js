import _ from 'underscore';
import {Link} from 'react-router-dom';

import {WRITE} from '../../../shared/constants/permission-levels';
import buildIsDone from '../../functions/build-is-done';
import cx from 'classnames';
import getBuildDescription from '../../../shared/functions/get-build-description';
import history from '../../constants/history';
import Icon from '../shared/icon';
import React, {Component} from 'react';

const REFRESH_INTERVAL = 1000;

const ICONS = {
  pending: 'clock-o',
  claimed: 'briefcase',
  pulling: 'download',
  building: 'wrench',
  pushing: 'upload',
  cancelled: 'ban',
  succeeded: 'check-circle',
  failed: 'exclamation-circle'
};

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
  <div className={cx(styles.root, styles[`status-${status}`])}>
    <div className={styles.content}>
      <Link className={styles.link} to={`/builds/${id}`}>
        <div className={styles.left}><Icon name={ICONS[status]} /></div>
        <div className={styles.center}>
          <div className={styles.title}>{getBuildDescription({build})}</div>
          {_.map(tags, (tag, key) =>
            <div {...{key}} className={styles.tag}>{tag}</div>)
          }
        </div>
      </Link>
      {
        !(build.role & WRITE) ? null :
        <div className={styles.right}>
          {
            buildIsDone({build}) ?
            <span className={styles.button} onClick={() => rebuild({props})}>
              <Icon name='repeat' />
            </span> :
            <span className={styles.button} onClick={() => cancel({props})}>
              <Icon name='ban' />
            </span>
          }
        </div>
      }
    </div>
    {error && <div className={styles.error}>{error}</div>}
  </div>;

export default withPave(
  class extends Component {
    componentWillMount() {
      this.reload();
    }

    componentDidUpdate({buildId}) {
      if (buildId !== this.props.buildId) this.reload();
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
      this.cancelReload();
      const {pave: {state: {build}, store}, withOutput} = this.props;
      if (!build) return this.delayReload();

      if (buildIsDone({build})) return;

      const {id, output, updatedAt} = build;
      const lastOutputAt =
        withOutput ? _.max([].concat(-1, _.map(output, '0'))) : undefined;
      store.run({
        query: [
          'getBuildUpdates!',
          {id, lastOutputAt, lastUpdatedAt: updatedAt},
          [].concat(
            'createdAt',
            'error',
            'id',
            'ref',
            'repo',
            'status',
            'tags',
            'updatedAt',
            withOutput ? 'output' : []
          )
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
    getQuery: ({props: {buildId, withOutput}}) => [
      'buildsById',
      buildId,
      [].concat(
        'createdAt',
        'error',
        'id',
        'ref',
        'repo',
        'status',
        'tags',
        'updatedAt',
        withOutput ? 'output' : []
      )
    ],

    getState: ({props: {buildId}, store}) => ({
      build: store.get(['buildsById', buildId])
    })
  }
);
