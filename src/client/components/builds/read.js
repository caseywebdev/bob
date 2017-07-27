import _ from 'underscore';
import {withPave} from 'pave-react';
import React, {Component} from 'react';
import Header from '../shared/header';
import Meta from '../shared/meta';
import styles from './read.scss';
import AU from 'ansi_up';
import ReactList from 'react-list';
import {CANCELLED, FAILED, SUCCEEDED} from '../../../shared/constants/statuses';

const ansiToHtml = ::(new AU()).ansi_to_html;

const REFRESH_INTERVAL = 1000;

const renderLine = ({key, line}) =>
  <div
    className={styles.line}
    {...{key}}
    dangerouslySetInnerHTML={{__html: `${ansiToHtml(line)}&nbsp;`}}
  />;

const render = ({
  props: {
    match: {params: {id}},
    pave: {state: {build: {output, status} = {}}}
  }
}) =>
  <Meta title={`Build #${id}`}>
    <div className={styles.root}>
      <Header>{`Build #${id}`}</Header>
      <div>Status: {status}</div>
      <div className={styles.lines}>
        <ReactList
          length={_.size(output)}
          itemRenderer={i => renderLine({key: i, line: output[i][1]})}
          type='uniform'
        />
      </div>
    </div>
  </Meta>;

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
      const {state: {build}, store} = this.props.pave;
      if (!build) return this.delayReload();

      const {id, output, status, updatedAt} = build;
      if (status === CANCELLED || status === FAILED || status === SUCCEEDED) {
        return;
      }

      const lastOutputAt = _.max([].concat(-1, _.map(output, '0')));
      store.run({
        query: [
          'getBuildUpdates!',
          {id, lastOutputAt, lastUpdatedAt: updatedAt}
        ]
      })
        .catch(::console.log)
        .then(() => this.delayReload());
    }

    render() {
      return render({props: this.props});
    }
  },
  {
    getQuery: ({props: {match: {params: {id}}}}) =>
      ['buildsById', id, [[], ['output']]],

    getState: ({props: {match: {params: {id}}}, store}) => ({
      build: store.get(['buildsById', id])
    })
  }
);
