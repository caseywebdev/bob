import _ from 'underscore';
import _str from 'underscore.string';
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
    pave: {state: {build: {status} = {}, lines}}
  }
}) =>
  <Meta title={`Build #${id}`}>
    <div className={styles.root}>
      <Header>{`Build #${id}`}</Header>
      <div>Status: {status}</div>
      <div className={styles.code}>
        <ReactList
          length={_.size(lines)}
          itemRenderer={i => renderLine({key: i, line: lines[i]})}
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
      clearTimeout(this.reloadTimeoutId);
    }

    reload = () => {
      const {status} = this.props.pave.state.build || {};
      if (status === CANCELLED || status === FAILED || status === SUCCEEDED) {
        return;
      }

      this.props.pave.reload();
      this.reloadTImeoutId = setTimeout(this.reload, REFRESH_INTERVAL);
    }

    render() {
      return render({props: this.props});
    }
  },
  {
    getQuery: ({props: {match: {params: {id}}}}) =>
      ['buildsById', id],

    getState: ({props: {match: {params: {id}}}, store}) => {
      const build = store.get(['buildsById', id]);
      const lines = build && _str.lines(build.output);
      return {build, lines};
    }
  }
);
