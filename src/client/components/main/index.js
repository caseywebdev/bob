import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import React from 'react';

const query = gql`
  query {
    viewer {
      id
      name
      userTokens {
        id
      }
    }
  }
`;

const render = ({props}) =>
  <pre>{JSON.stringify(props.data, null, 2)}</pre>;

export default graphql(query)(props => render({props}));
