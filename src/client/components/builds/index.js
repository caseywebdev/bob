import _ from 'underscore';
import {withPave} from 'pave-react';
import Description from './description';
import React from 'react';
import ReactList from 'react-list';
import styles from './index.scss';

const renderBuild = ({build: {id}}) =>
  <div className={styles.build} key={id}>
    <Description buildId={id} />
  </div>;

const render = ({props: {pave: {state: {builds}}}}) =>
  <ReactList
    itemRenderer={index => renderBuild({build: builds[index]})}
    length={builds.length}
    threshold={1000}
  />;

export default withPave(
  props => render({props}),
  {
    getQuery: () => ['builds'],

    getState: ({store}) => ({
      builds: _.sortBy(store.get(['builds']), 'id').reverse()
    })
  }
);
