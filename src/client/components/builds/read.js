import _ from 'underscore';
import _str from 'underscore.string';
import {withPave} from 'pave-react';
import Anser from 'anser';
import buildIsDone from '../../functions/build-is-done';
import cx from 'classnames';
import Description from './description';
import ErrorComponent from '../shared/error';
import Loading from '../shared/loading';
import Meta from '../shared/meta';
import React, {Component} from 'react';
import ReactList from 'react-list';
import styles from './read.scss';

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
        !build ? <div className={styles.loading}><Loading /></div> :
        <div className={styles.content}>
          <div className={styles.description}>
            <Description buildId={build.id} withOutput />
          </div>
          <div className={styles.output}>
            <ReactList
              itemRenderer={i => renderLine({key: i, line: lines[i]})}
              length={lines.length}
              ref={c => component.output = c}
              type='uniform'
              />
          </div>
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

export default withPave(
  class extends Component {
    state = {follow: false};

    componentWillMount() {
      this.scrollY = 0;
    }

    componentDidMount() {
      this.setScrollListener();
      window.addEventListener('scroll', this.handleScroll);
    }

    componentWillReceiveProps({pave: {state: {build}}}) {
      if (build) {
        const current = this.props.pave.state.build;
        if (current && current.id !== build.id) {
          this.followSet = false;
          this.scrollY = 0;
        }
        if (!this.followSet) {
          this.followSet = true;
          this.setState({follow: !buildIsDone({build})});
        }
      }
    }

    componentDidUpdate() {
      const {output, state: {follow}} = this;
      if (output && follow) {
        cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(() =>
          output.scrollAround(this.props.pave.state.lines.length - 1)
        );
      }
      this.setScrollListener();
    }

    componentWillUnmount() {
      const {output} = this;
      if (output) {
        const scrollParent = output.getScrollParent();
        scrollParent.removeEventListener('scroll', this.handleScroll);
      }
      cancelAnimationFrame(this.rafId);
    }

    setScrollListener() {
      const {output, props: {pave: {state: {build}}}} = this;
      if (!output) return;

      const scrollParent = output.getScrollParent();
      scrollParent.removeEventListener('scroll', this.handleScroll);
      if (build && buildIsDone({build})) return;

      scrollParent.addEventListener('scroll', this.handleScroll);
    }

    handleScroll = () => {
      const {output, props: {pave: {state: {build, lines}}}, state: {follow}} =
        this;
      if (build && buildIsDone({build})) {
        window.removeEventListener('scroll', this.handleScroll);
        if (follow) this.setState({follow: false});
        return;
      }

      if (!output) return;

      const {clientHeight, scrollHeight, scrollTop} = output.getScrollParent();
      const scrollY =
        Math.max(0, Math.min(scrollTop, scrollHeight - clientHeight));
      const delta = scrollY - this.scrollY;
      this.scrollY = scrollY;
      if (follow) {
        if (delta < 0) this.setState({follow: false});
        return;
      }

      const lastVisible = this.output.getVisibleRange()[1];
      if (lastVisible === lines.length - 1) this.setState({follow: true});
    }

    render() {
      return render({component: this});
    }
  },
  {
    getQuery: ({props: {match: {params: {id}}}}) => ['buildsById', id],

    getState: ({props: {match: {params: {id}}}, store}) => {
      const build = store.get(['buildsById', id]);
      return {build, lines: toLines({build})};
    }
  }
);
