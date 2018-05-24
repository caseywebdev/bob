import {Mutation} from 'react-apollo';
import Center from './shared/center';
import gql from 'graphql-tag';
import Loading from './shared/loading';
import Notice from './shared/notice';
import React, {Component} from 'react';
import updateToken from '../functions/update-token';

export default class extends Component {
  state = {
    emailAddress: ''
  }

  render() {
    const {emailAddress} = this.state;
    return (
      <Mutation
        mutation={gql`
          mutation($input: SignInInput!) {
            signIn(input: $input) {
              userToken {
                token
              }
            }
          }
        `}
      >
        {(mutate, {error, loading}) =>
          <Center>
            {
              loading ? <Loading size='large' /> :
              <form
                onSubmit={ev => {
                  ev.preventDefault();
                  mutate({variables: {input: {emailAddress}}})
                    .then(({data: {signIn: {userToken: {token}}}}) =>
                      updateToken(token)
                    );
                }}
              >
                Sign In
                {error && <Notice type='error'>{error.toString()}</Notice>}
                <input
                  autoComplete='username'
                  type='email'
                  value={emailAddress}
                  onChange={({target: {value}}) =>
                    this.setState({emailAddress: value})
                  }
                />
                <button>Sign In</button>
              </form>
            }
          </Center>
        }
      </Mutation>
    );
  }
}
