import {Mutation} from 'react-apollo';
import Center from './shared/center';
import gql from 'graphql-tag';
import Loading from './shared/loading';
import Notice from './shared/notice';
import React, {Component} from 'react';

const CREATE_EMAIL_ADDRESS_CLAIM_MUTATION = gql`
  mutation($input: CreateEmailAddressClaimInput!) {
    createEmailAddressClaim(input: $input)
  }
`;

export default class extends Component {
  state = {
    emailAddress: ''
  }

  render() {
    const {emailAddress} = this.state;
    return (
      <Mutation mutation={CREATE_EMAIL_ADDRESS_CLAIM_MUTATION}>
        {(mutate, {data: {createEmailAddressClaim} = {}, error, loading}) =>
          <Center>
            {loading && <Loading size='large' />}
            {error && <Notice type='error'>{error.toString()}</Notice>}
            {createEmailAddressClaim && 'Email sent'}
            {!loading && !createEmailAddressClaim &&
              <form
                onSubmit={ev => {
                  ev.preventDefault();
                  mutate({variables: {input: {emailAddress}}});
                }}
              >
                Enter your email to sign in or create an account
                <input
                  autoComplete='username'
                  type='email'
                  value={emailAddress}
                  onChange={(({target: {value}}) =>
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
  }
}
