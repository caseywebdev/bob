import _ from 'underscore';
import {withPave} from 'pave-react';
import Description from './description';
import React from 'react';
import styles from './index.scss';

const renderBuild = build =>
  <div className={styles.build} key={build.id}>
    <Description {...{build}} />
  </div>;

const render = ({props: {pave: {state: {builds}}}}) =>
  <div className={styles.root}>{_.map(builds, renderBuild)}</div>;

export default withPave(
  props => render({props}),
  {
    getQuery: () => ['builds'],

    getState: ({store}) => ({
      builds: _.sortBy(store.get(['builds']), 'id').reverse()
    })
  }
);
