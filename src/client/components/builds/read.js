import _ from 'underscore';
import {withPave} from 'pave-react';
import React from 'react';
import Header from '../shared/header';
import Meta from '../shared/meta';
import styles from './read.scss';
import AU from 'ansi_up';
import ReactList from 'react-list';

const ansiToHtml = ::(new AU()).ansi_to_html;

const renderLogLine = ({index, content: {id, progress, status, stream}}) =>
  <div
    className={styles.logLine}
    key={index}
    dangerouslySetInnerHTML={{
      __html: ansiToHtml(
        _.compact([id, status, progress, stream]).join(' ') || ''
      ) + '&nbsp;'
    }}
  />;

const render = ({
  props: {
    match: {params: {id}},
    pave: {state: {build: {status} = {}, logLines}}
  }
}) =>
  <Meta title={`Build #${id}`}>
    <div className={styles.root}>
      <Header>{`Build #${id}`}</Header>
      <div>Status: {status}</div>
      <div className={styles.code}>
        <ReactList
          length={_.size(logLines)}
          itemRenderer={i => renderLogLine(logLines[i])}
          type='uniform'
        />
      </div>
    </div>
  </Meta>;

export default withPave(
  props => render({props}),
  {
    getQuery: ({props: {match: {params: {id}}}}) =>
      ['buildsById', id, [[], 'logLines']],

    getState: ({props: {match: {params: {id}}}, store}) => {
      const build = store.get(['buildsById', id]);
      return {
        build,
        logLines: _.reject((build || {}).logLines, ({content: {aux}}) => aux)
      };
    }
  }
);
