import {Mutation} from 'react-apollo';
import Center from './shared/center';
import gql from 'graphql-tag';
import history from '../constants/history';
import Loading from './shared/loading';
import Notice from './shared/notice';
import React, {Component} from 'react';
import updateToken from '../functions/update-token';

const VERIFY_EMAIL_ADDRESS_MUTATION = gql`
  mutation($input: VerifyEmailAddressClaimInput!) {
    verifyEmailAddressClaim(input: $input) {
      token
    }
  }
`;

class Verify extends Component {
  componentDidMount() {
    const {token, verify} = this.props;
    verify({variables: {input: {token}}})
      .then(({data: {verifyEmailAddressClaim: {token}}}) => {
        updateToken(token);
        history.replace('/');
      });
  }

  render() {
    const {error, loading} = this.props;
    return (
      <Center>
        {loading && <Loading size='large' />}
        {error && <Notice type='error'>{error.toString()}</Notice>}
      </Center>
    );
  }
}

export default ({location}) => {
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  return (
    <Mutation mutation={VERIFY_EMAIL_ADDRESS_MUTATION}>
      {(verify, {error, loading}) =>
        <Verify {...{error, loading, token, verify}} />
      }
    </Mutation>
  );
};
