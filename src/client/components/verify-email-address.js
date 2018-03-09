import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import React, {Component} from 'react';

const query = gql`
  mutation($input: VerifyEmailAddressInput!) {
    verifyEmailAddress(input: $input) {
      userEmailAddress {
        emailAddress
      }
    }
  }
`;

export default graphql(query)(
  class extends Component {
    componentWillMount() {
      const query = new URLSearchParams(this.props.location.search);
      const input = {
        userEmailAddressId: query.get('userEmailAddressId'),
        token: query.get('token')
      };
      this.props.mutate({variables: {input}});
    }

    render() {
      const {props} = this;
      return <pre>{JSON.stringify(props, null, 2)}</pre>;
    }
  }
);
