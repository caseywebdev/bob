import _ from 'underscore';
import {withPave} from 'pave-react';
import Description from './description';
import React, {Component} from 'react';
import ReactList from 'react-list';
import styles from './index.scss';

const renderBuild = ({
  component,
  component: {
    props: {
      pave: {
        state: {
          builds
        }
      }
    }
  },
  index
}) =>
  <div className={styles.build} key={index}>
    {
      builds[index] ? <Description buildId={builds[index].id} /> :
      component.setSize(index + 1) || 'Loading...'
    }
  </div>;

const render = ({component, component: {props: {pave: {state: {builds}}}}}) =>
  <ReactList
    itemRenderer={index => renderBuild({component, index})}
    length={Math.min(_.compact(builds).length + 1, builds.length)}
    threshold={1000}
  />;

export default withPave(
  class extends Component {
    size = 100;

    componentWillUnmount() {
      clearTimeout(this.setSizeTimeoutId);
    }

    setSize(size) {
      size = Math.ceil(size / 100) * 100;
      if (size <= this.size) return;

      this.size = size;
      const {setParams} = this.props.pave;
      clearTimeout(this.setSizeTimeoutId);
      this.setSizeTimeoutId = setTimeout(() => setParams({size}));
    }

    render() {
      return render({component: this});
    }
  },
  {
    params: {size: 100},

    getQuery: ({params: {before, size}, setParams}) => {
      if (!before) setParams({before: before = new Date()});
      return ['builds', {before}, _.range(0, size).concat('length')];
    },

    getState: ({params: {before}, store}) => ({
      builds: store.get(['builds', {before}]) || []
    })
  }
);
