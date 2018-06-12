import {Mutation, Query, Subscription} from 'react-apollo';
import {Route} from 'react-router-dom';
import Center from './shared/center';
import gql from 'graphql-tag';
import Loading from './shared/loading';
import Notice from './shared/notice';
import React, {Component, Fragment} from 'react';

const SUBSCRIPTION = gql`
  subscription {
    emailAddressClaimCreated
  }
`;

const SIGN_IN_MUTATION = gql`
  mutation($input: CreateEmailAddressClaimInput!) {
    createEmailAddressClaim(input: $input)
  }
`;

const EMAIL_ADDRESS_FROM_TOKEN_QUERY = gql`
  query($token: String!) {
    emailAddressFromToken(token: $token)
  }
`;

const WithToken = ({token}) =>
  <Query query={EMAIL_ADDRESS_FROM_TOKEN_QUERY} variables={{token}}>
    {({data: {emailAddressFromToken} = {}, error, loading}) =>
      <Center>
        {loading && <Loading size='large' />}
        {error && <Notice type='error'>{error.toString()}</Notice>}
        {emailAddressFromToken && <pre>verified {emailAddressFromToken}, now what?</pre>}
      </Center>
    }
  </Query>;

class WithoutToken extends Component {
  state = {
    emailAddress: ''
  }

  render() {
    const {emailAddress} = this.state;
    return (
      <Subscription subscription={SUBSCRIPTION}>
        {({data, error}) =>
          <Fragment>
            <pre>{JSON.stringify(data)}{JSON.stringify(error)}</pre>
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
          </Fragment>
        }
      </Subscription>
    );
  }
}

export default () =>
  <Route render={({location}) => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    return token ? <WithToken {...{token}} /> : <WithoutToken />;
  }} />;
