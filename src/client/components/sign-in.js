import {graphql} from 'react-apollo';
import Center from './shared/center';
import gql from 'graphql-tag';
import Loading from './shared/loading';
import Notice from './shared/notice';
import React, {Component} from 'react';
import updateToken from '../functions/update-token';

export default graphql(gql`
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
        updateToken(token);
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
              Sign In
              {error && <Notice type='error'>{error.toString()}</Notice>}
              <input
                autoComplete='email'
                type='email'
                value={emailAddress}
                onChange={({target: {value}}) =>
                  this.setState({emailAddress: value})
                }
              />
              <input
                autoComplete='current-password'
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
