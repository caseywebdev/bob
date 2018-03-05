import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import React, {Component} from 'react';

const query = gql`
  mutation($input: VerifyEmailAddressInput!) {
    verifyEmailAddress(input: $input) {
      emailAddress {
        emailAddress
      }
    }
  }
`;

export default graphql(query)(
  class extends Component {
    componentWillMount() {
      this.props.mutate({variables: {input: this.props.match.params}});
    }

    render() {
      const {props} = this;
      return <pre>{JSON.stringify(props, null, 2)}</pre>;
    }
  }
);
