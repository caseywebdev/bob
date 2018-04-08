import {graphql} from 'react-apollo';
import {Link, Route, Switch} from 'react-router-dom';
import B from '../shapes/b';
import createAsyncComponent from '../../functions/create-async-component';
import disk from '../../constants/disk';
import gql from 'graphql-tag';
import React, {Component} from 'react';
import styles from './index.scss';
import Center from '../shared/center';
import Loading from '../shared/loading';
import Notice from '../shared/notice';

const Home = createAsyncComponent(() => import('./home'));
const NotFound = createAsyncComponent(() => import('../shared/not-found'));

const SignIn = graphql(gql`
  mutation($input: SignInInput!) {
    signIn(input: $input) {
      userToken {
        token
      }
    }
  }
`)(
  class extends Component {
    state = {
      emailAddress: '',
      error: null,
      isLoading: false,
      password: ''
    }

    submit = async () => {
      const {props: {mutate}, state: {emailAddress, password}} = this;
      this.setState({error: null, isLoading: true});
      try {
        const {data: {signIn: {userToken: {token}}}} =
          await mutate({variables: {input: {emailAddress, password}}});
        disk.set('token', token);
        this.setState({isLoading: false});
      } catch (error) {
        this.setState({error, isLoading: false});
      }
    }

    render() {
      const {emailAddress, error, isLoading, password} = this.state;
      return (
        <Center>
          {
            isLoading ? <Loading size='large' /> :
            <div>
              {error && <Notice type='error'>{error.toString()}</Notice>}
              <input
                type='text'
                value={emailAddress}
                onChange={({target: {value}}) =>
                  this.setState({emailAddress: value})
                }
              />
              <input
                type='password'
                value={password}
                onChange={({target: {value}}) =>
                  this.setState({password: value})
                }
              />
              <button onClick={this.submit}>Sign In</button>
            </div>
          }
        </Center>
      );
    }
  }
);

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
    <button
      onClick={() =>
        mutate().then(() => {
          disk.remove('token');
          location.reload();
        })
      }
    >
      Sign Out
    </button>
);

export default () =>
  <div className={styles.root}>
    <div className={styles.nav}>
      <Link className={styles.navItem} to='/'>
        <B className={styles.bShape} />
      </Link>
      <SignOut />
    </div>
    <div className={styles.content}>
      <SignIn />
      <Switch>
        <Route exact path='/' component={Home} />
        <Route component={NotFound} />
      </Switch>
    </div>
  </div>;
