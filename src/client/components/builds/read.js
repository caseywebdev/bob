import _ from 'underscore';
import _str from 'underscore.string';
import {withPave} from 'pave-react';
import Anser from 'anser';
import cx from 'classnames';
import React, {Component} from 'react';
import Header from '../shared/header';
import Meta from '../shared/meta';
import styles from './read.scss';
import ReactList from 'react-list';
import {CANCELLED, FAILED, SUCCEEDED} from '../../../shared/constants/statuses';

const REFRESH_INTERVAL = 1000;

const isDone = ({build: {status}}) =>
  status === CANCELLED || status === FAILED || status === SUCCEEDED;

const renderLine = ({key, line}) =>
  <div {...{key}} className={styles.outputLine}>
    {_.map(line, ({bg, content, fg}, key) =>
      <span {...{key}} className={cx(styles[`${bg}-bg`], styles[`${fg}-fg`])}>
        {content}
      </span>
    )}
    {_.any(line, 'content') ? null : ' '}
  </div>;

const render = ({
  component,
  component: {
    props: {
      match: {params: {id}},
      pave: {state: {build: {status} = {}, lines}}
    }
  }
}) =>
  <Meta title={`Build #${id}`}>
    <div className={styles.root}>
      <Header>{`Build #${id}`}</Header>
      <div>Status: {status}</div>
      <div className={styles.output}>
        <ReactList
          itemRenderer={i => renderLine({key: i, line: lines[i]})}
          length={lines.length}
          ref={c => component.output = c}
          type='uniform'
        />
      </div>
    </div>
  </Meta>;

const toLines = ({build}) => {
  if (!build) return [];

  const ansi = _.map(build.output, 1).join('\n');
  const chunks = Anser.ansiToJson(ansi, {use_classes: true});
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

const getScrollY = () =>
  Math.max(
    0,
    Math.min(
      window.scrollY,
      document.body.clientHeight - window.innerHeight
    )
  );

export default withPave(
  class extends Component {
    state = {follow: false};

    componentWillMount() {
      this.scrollY = getScrollY();
      this.reload();
    }

    componentDidMount() {
      window.addEventListener('scroll', this.handleScroll);
    }

    componentWillReceiveProps({pave: {state: {build}}}) {
      if (!this.initialFollowSet && build) {
        this.initialFollowSet = true;
        this.setState({follow: !isDone({build})});
      }
    }

    componentDidUpdate() {
      if (this.state.follow) {
        this.output.scrollAround(this.props.pave.state.lines.length - 1);
      }
    }

    componentWillUnmount() {
      window.removeEventListener('scroll', this.handleScroll);
      this.cancelReload();
    }

    handleScroll = () => {
      const scrollY = getScrollY();
      const delta = scrollY - this.scrollY;
      this.scrollY = scrollY;

      const {follow} = this.state;
      if (delta < 0) return follow && this.setState({follow: false});

      if (follow) return;

      const last = this.props.pave.state.lines.length - 1;
      const lastVisible = this.output.getVisibleRange()[1];
      if (lastVisible === last) this.setState({follow: true});
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

      if (isDone({build})) return;

      const {id, output, updatedAt} = build;
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
      return render({component: this});
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
