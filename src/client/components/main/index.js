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
const SignIn = createAsyncComponent(() => import('../sign-in'));
const VerifyEmailAddressClaim = createAsyncComponent(() =>
  import('../verify-email-address-claim')
);

const VIEWER_QUERY = gql`
  query {
    viewer {
      id
      name
      avatarUrl
      userTokens {
        id
        roles
        lastUsedAt
        updatedAt
        createdAt
        userAgent
        ipAddress
      }
    }
  }
`;

const DELETE_USER_TOKEN_MUTATION = gql`
  mutation {
    deleteUserToken(input: {self: true})
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
          {viewer && <img src={viewer.avatarUrl} style={{width: 40}}/>}
          {
            viewer &&
            <Mutation
              mutation={DELETE_USER_TOKEN_MUTATION}
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
            <Route exact path='/sign-in' component={SignIn} />
            <Route
              exact path='/verify-email-address-claim'
              component={VerifyEmailAddressClaim}
            />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    }
  </Query>;
