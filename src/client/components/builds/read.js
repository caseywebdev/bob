import _ from 'underscore';
import _str from 'underscore.string';
import {withPave} from 'pave-react';
import Anser from 'anser';
import buildIsDone from '../../utils/build-is-done';
import cx from 'classnames';
import Description from './description';
import ErrorComponent from '../shared/error';
import Loading from '../shared/loading';
import Meta from '../shared/meta';
import React, {Component} from 'react';
import ReactList from 'react-list';
import styles from './read.scss';

const REFRESH_INTERVAL = 1000;

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
      pave: {error, state: {build, lines}}
    }
  }
}) =>
  <Meta title={`Build #${id}`}>
    <div className={styles.root}>
      {
        error ? <ErrorComponent {...{error}} /> :
        !build ? <Loading /> :
        <div>
          <div className={styles.description}>
            <Description {...{build}} />
          </div>
          {
            !lines.length ? null :
            <div className={styles.output}>
              <ReactList
                itemRenderer={i => renderLine({key: i, line: lines[i]})}
                length={lines.length}
                ref={c => component.output = c}
                type='uniform'
                />
            </div>
          }
        </div>
      }
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
      if (!this.followSet && build) {
        this.followSet = true;
        this.setState({follow: !buildIsDone({build})});
      }
    }

    componentDidUpdate() {
      const {output, props: {pave: {state: {lines}}}, state: {follow}} = this;
      if (output && follow) output.scrollAround(lines.length - 1);
    }

    componentWillUnmount() {
      window.removeEventListener('scroll', this.handleScroll);
      this.cancelReload();
    }

    handleScroll = () => {
      const {output, props: {pave: {state: {build, lines}}}, state: {follow}} =
        this;
      if (build && buildIsDone({build})) {
        window.removeEventListener('scroll', this.handleScroll);
        if (follow) this.setState({follow: false});
        return;
      }

      const scrollY = getScrollY();
      const delta = scrollY - this.scrollY;
      this.scrollY = scrollY;
      if (follow) {
        if (delta < 0) this.setState({follow: false});
        return;
      }

      if (!output) return;

      const lastVisible = this.output.getVisibleRange()[1];
      if (lastVisible === lines.length - 1) this.setState({follow: true});
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

      if (buildIsDone({build})) return;

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
