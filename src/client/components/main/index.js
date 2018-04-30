import {Mutation, Query as _Query} from 'react-apollo';
import {Link, Route, Switch} from 'react-router-dom';
import B from '../shapes/b';
import createAsyncComponent from '../../functions/create-async-component';
import disk from '../../constants/disk';
import gql from 'graphql-tag';
import React, {Fragment} from 'react';
import styles from './index.scss';
import updateToken from '../../functions/update-token';

const Query = props => props.skip ? props.children() : <_Query {...props} />;

const Home = createAsyncComponent(() => import('./home'));
const NotFound = createAsyncComponent(() => import('../shared/not-found'));

const VIEWER_QUERY = gql`
  query {
    viewer {
      id
      name
      userTokens {
        id
        roles
        lastUsedAt
        updatedAt
      }
    }
  }
`;

const SIGN_OUT_MUTATION = gql`
  mutation {
    signOut {
      userToken {
        id
      }
    }
  }
`;

export default () =>
  <Query query={VIEWER_QUERY} skip={!disk.get('token')}>
    {({data: {viewer} = {}, error, loading} = {}) =>
      <div className={styles.root}>
        <div className={styles.nav}>
          <Link className={styles.navItem} to='/'>
            <B className={styles.bShape} />
          </Link>
          {
            viewer &&
            <Mutation
              mutation={SIGN_OUT_MUTATION}
              onCompleted={() => updateToken()}
            >
              {(mutate, {error, loading}) =>
                <Fragment>
                  {loading && 'Loading...'}
                  {error && error.toString()}
                  <button onClick={() => mutate()}>Sign Out</button>
                </Fragment>
              }
            </Mutation>
          }
        </div>
        <div className={styles.content}>
          <Switch>
            <Route
              exact path='/'
              render={props => <Home {...{...props, error, loading, viewer}} />}
            />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    }
  </Query>;
