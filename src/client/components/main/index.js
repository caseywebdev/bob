import {graphql} from 'react-apollo';
import {Link, Route, Switch} from 'react-router-dom';
import B from '../shapes/b';
import createAsyncComponent from '../../functions/create-async-component';
import disk from '../../constants/disk';
import gql from 'graphql-tag';
import React from 'react';
import styles from './index.scss';
import updateToken from '../../functions/update-token';

const Home = createAsyncComponent(() => import('./home'));
const NotFound = createAsyncComponent(() => import('../shared/not-found'));

const SignOut = graphql(gql`
  mutation {
    signOut {
      userToken {
        id
      }
    }
  }
`)(
  ({mutate}) =>
    <button onClick={() => mutate().then(() => updateToken())}>
      Sign Out
    </button>
);

export default graphql(gql`
  query {
    viewer {
      id
      name
    }
  }
`, {
  skip: () => !disk.get('token')
})(
  ({data: {loading, viewer} = {}}) =>
    <div className={styles.root}>
      <div className={styles.nav}>
        <Link className={styles.navItem} to='/'>
        <B className={styles.bShape} />
      </Link>
      {viewer && <SignOut />}
    </div>
    <div className={styles.content}>
      <Switch>
        <Route
          exact path='/'
          render={props => <Home {...{...props, loading, viewer}} />}
        />
        <Route component={NotFound} />
      </Switch>
    </div>
  </div>
);
