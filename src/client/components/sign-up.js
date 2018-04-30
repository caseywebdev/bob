import {Mutation, Query as _Query} from 'react-apollo';
import gql from 'graphql-tag';
import Loading from './shared/loading';
import Meta from './shared/meta';
import Notice from './shared/notice';
import React, {Component} from 'react';

const Query = props => props.skip ? props.children() : <_Query {...props} />;

const getToken = ({location: {search}}) =>
  (new URLSearchParams(search)).get('token');

// graphql(gql`
//   mutation($input: SignUpInput!) {
//     signUp(input: $input) {
//       user {
//         id
//       }
//     }
//   }
// `, {
//   name: 'signUp'
// })

class ClaimEmailAddress extends Component {
  state = {
    emailAddress: ''
  };

  render() {
    return (
      <Mutation
        mutation={gql`
          mutation($input: ClaimEmailAddressInput!) {
            claimEmailAddress(input: $input) {
              userEmailAddress {
                id
              }
            }
          }
        `}
      >
        {() =>
          <div>
            <input
              value={''}
              onChange={({target: {value}}) =>
                this.setState({emailAddress: value})
              }
            />
            <button onClick={this.submit}>Next</button>
          </div>
        }
      </Mutation>
    );
  }
}

const SignUp = () => <div />;

export default ({location}) => {
  const token = getToken({location});
  return (
    <Query
      query={gql`
        query($token: String!) {
          userEmailAddress(token: $token) {
            id
            emailAddress
          }
        }
      `}
      skip={!token}
      variables={{token}}
    >
      {({data: {emailAddress} = {}, error, loading}) =>
        <Meta title='Sign Up'>
          {loading && <Loading size='large' />}
          {error && <Notice type='error'>{error.message}</Notice>}
          {
            emailAddress ? <SignUp {...{emailAddress, token}} /> :
            <ClaimEmailAddress />
          }
        </Meta>
      }
    </Query>
  );
};
