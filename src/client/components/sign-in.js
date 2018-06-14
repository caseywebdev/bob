import {Mutation, Subscription} from 'react-apollo';
import {Route} from 'react-router-dom';
import Center from './shared/center';
import gql from 'graphql-tag';
import Loading from './shared/loading';
import Notice from './shared/notice';
import React, {Component} from 'react';
import history from '../constants/history';

const EMAIL_ADDRESS_CLAIM_VERIFIED_SUBSCRIPTION = gql`
  subscription($id: UUID!) {
    emailAddressClaimVerified(id: $id)
  }
`;

const SIGN_IN_MUTATION = gql`
  mutation($input: CreateEmailAddressClaimInput!) {
    createEmailAddressClaim(input: $input) {
      emailAddressClaimId
    }
  }
`;

const VERIFY_EMAIL_ADDRESS_CLAIM_MUTATION = gql`
  mutation($input: VerifyEmailAddressClaimInput!) {
    verifyEmailAddressClaim(input: $input)
  }
`;

class Verify extends Component {
  componentDidMount() {
    this.props.mutate();
  }

  render() {
    const {error, loading} = this.props;
    return (
      <Center>
        {loading && <Loading size='large' />}
        {error && <Notice type='error'>{error.toString()}</Notice>}
        {!loading && !error && <div>Verified! You may close this window</div>}
      </Center>
    );
  }
}

const WithToken = ({token}) =>
  <Mutation
    mutation={VERIFY_EMAIL_ADDRESS_CLAIM_MUTATION}
    variables={{input: {token}}}
  >
    {(mutate, {error, loading}) =>
      <Verify {...{error, loading, mutate}} />
    }
  </Mutation>;

const WithId = ({id}) =>
  <Subscription
    subscription={EMAIL_ADDRESS_CLAIM_VERIFIED_SUBSCRIPTION}
    variables={{id}}
  >
    {({data: {emailAddressClaimVerified} = {}, error, loading}) =>
      <Center>
        {loading && <Loading size='large' />}
        {error && <Notice type='error'>{error.toString()}</Notice>}
        {emailAddressClaimVerified ? 'verified' : 'waiting for verified'}
      </Center>
    }
  </Subscription>;

class Initial extends Component {
  state = {
    emailAddress: ''
  }

  render() {
    const {emailAddress} = this.state;
    return (
      <Mutation mutation={SIGN_IN_MUTATION}>
        {(mutate, {error, loading}) =>
          <Center>
            {
              loading ? <Loading size='large' /> :
              <form
                onSubmit={ev => {
                  ev.preventDefault();
                  mutate({variables: {input: {emailAddress, intent: 'SIGN_IN'}}})
                    .then(({data: {createEmailAddressClaim: {emailAddressClaimId}}}) =>
                      history.replace(`/sign-in?id=${emailAddressClaimId}`)
                    );
                }}
              >
                Sign In
                {error && <Notice type='error'>{error.toString()}</Notice>}
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

export default () =>
  <Route render={({location}) => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const token = params.get('token');
    return (
      id ? <WithId {...{id}} /> :
      token ? <WithToken {...{token}} /> :
      <Initial />
    );
  }} />;
