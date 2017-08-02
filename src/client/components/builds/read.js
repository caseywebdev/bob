import _ from 'underscore';
import _str from 'underscore.string';
import {withPave} from 'pave-react';
import Anser from 'anser';
import React, {Component} from 'react';
import Header from '../shared/header';
import Meta from '../shared/meta';
import styles from './read.scss';
import ReactList from 'react-list';
import {CANCELLED, FAILED, SUCCEEDED} from '../../../shared/constants/statuses';

const REFRESH_INTERVAL = 1000;

const renderLine = ({key, line}) =>
  <div {...{key}} className={styles.line}>
    {_.map(line, ({bg, content, fg}, key) =>
      <span
        {...{key}}
        style={{
          backgroundColor: bg ? `rgb(${bg})` : undefined,
          color: fg ? `rgb(${fg})` : undefined
        }}
      >
        {content || ' '}
      </span>
    )}
  </div>;

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
      <div className={styles.lines}>
        <ReactList
          length={lines.length}
          itemRenderer={i => renderLine({key: i, line: lines[i]})}
          type='uniform'
        />
      </div>
    </div>
  </Meta>;

const toLines = ({build}) => {
  if (!build) return [];

  const ansi = _.map(build.output, 1).join('\n');
  const chunks = Anser.ansiToJson(ansi);
  if (!chunks) return [];

  const lines = [];
  let line;
  let chunk;
  for (let {bg, content, fg} of chunks) {
    if (!content) continue;

    if (!line) lines.push(line = []);
    if (!chunk) line.push(chunk = {bg, content: '', fg});
    if ((bg === chunk.bg && fg === chunk.fg) || !chunk.content) {
      _.extend(chunk, {bg, content: chunk.content + content, fg});
    } else {
      line.push(chunk = {bg, content, fg});
    }
    const chunkLines = _str.lines(chunk.content);
    chunk.content = chunkLines[0];
    for (let content of chunkLines.slice(1)) {
      lines.push(line = []);
      line.push(chunk = {bg, content, fg});
    }
  }
  return lines;
};

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

    getState: ({props: {match: {params: {id}}}, store}) => {
      const build = store.get(['buildsById', id]);
      return {build, lines: toLines({build})};
    }
  }
);
