import {Mutation} from 'react-apollo';
import {Route} from 'react-router-dom';
import Center from './shared/center';
import gql from 'graphql-tag';
import Loading from './shared/loading';
import Notice from './shared/notice';
import React, {Component} from 'react';

const SIGN_IN_MUTATION = gql`
  mutation($input: CreateEmailAddressClaimInput!) {
    createEmailAddressClaim(input: $input)
  }
`;

export default class extends Component {
  state = {
    emailAddress: ''
  }

  render() {
    return (
      <Route render={({location}) => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const emailAddress = params.get('emailAddress') || this.state.emailAddress;
        return (
          <Mutation mutation={SIGN_IN_MUTATION}>
            {(mutate, {data: {createEmailAddressClaim: success} = {}, error, loading}) =>
              <Center>
                {
                  loading ? <Loading size='large' /> :
                  <form
                    onSubmit={ev => {
                      ev.preventDefault();
                      mutate({variables: {input: {emailAddress, intent: 'SIGN_IN'}}});
                    }}
                  >
                    Sign In
                    {error && <Notice type='error'>{error.toString()}</Notice>}
                    {success && 'Success!'}
                    <input
                      autoComplete='username'
                      disabled={!!token}
                      type='email'
                      value={emailAddress}
                      onChange={token ? null : (({target: {value}}) =>
                        this.setState({emailAddress: value})
                      )}
                    />
                    <button>Sign In</button>
                  </form>
                }
              </Center>
            }
          </Mutation>
        );
      }}
    />);
  }
}
