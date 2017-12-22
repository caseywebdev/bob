// import {graphql} from 'react-apollo';
import disk from '../../constants/disk';
// import gql from 'graphql-tag';
import React, {Component} from 'react';

export default class extends Component {
  componentWillMount() {
    const {history, pave: {store}} = this.props;
    const {searchParams} = new URL(location.href);
    const redirect = () => history.replace('/');
    const state = disk.get('githubState');
    if (!state || searchParams.get('state') !== state) return redirect();

    disk.remove('githubState');
    store.run({query: ['signInGithub!', searchParams.get('code')]})
      .then(() => disk.set('auth', store.get(['auth'])))
      .catch(::console.error)
      .then(redirect);
  }

  render() {
    return <div>Signing in...</div>;
  }
}
