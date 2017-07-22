import _ from 'underscore';
import {withPave} from 'pave-react';
import disk from '../../utils/disk';
import React, {Component} from 'react';

export default withPave(
  class extends Component {
    componentWillMount() {
      const {history, pave: {store}} = this.props;
      const {searchParams} = new URL(location.href);
      store.run({query: ['authGithub!', searchParams.get('code')]})
        .then(() => disk.set('auth', store.get(['auth'])))
        .catch(_.noop)
        .then(() => history.replace('/'));
    }

    render() {
      return <div>Signing in...</div>;
    }
  }
);
