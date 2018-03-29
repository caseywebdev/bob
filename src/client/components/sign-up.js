import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import React, {Component} from 'react';

const query = gql`
  mutation($input: SignUpInput!) {
    signUp(input: $input) {
      user {
        id
        name
        userEmailAddresses {
          id
          emailAddress
        }
      }
    }
  }
`;

export default graphql(query)(
  class extends Component {
    componentDidMount() {
      const query = new URLSearchParams(this.props.location.search);
      const input = {
        token: query.get('token'),
        name: 'Casey',
        password: 'password'
      };
      this.props.mutate({variables: {input}});
    }

    render() {
      const {props} = this;
      return <pre>{JSON.stringify(props, null, 2)}</pre>;
    }
  }
);
