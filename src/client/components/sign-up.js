import {Mutation, Query as _Query} from 'react-apollo';
import gql from 'graphql-tag';
import Loading from './shared/loading';
import Meta from './shared/meta';
import Notice from './shared/notice';
import React, {Component} from 'react';

const Query = props => props.skip ? props.children() : <_Query {...props} />;

const getToken = ({location: {search}}) =>
  (new URLSearchParams(search)).get('token');

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
        {(mutate, {error, loading}) =>
          <form
            onSubmit={ev => {
              ev.preventDefault();
              mutate({
                variables: {input: {emailAddress: this.state.emailAddress}}
              });
            }}
          >
            <pre>{JSON.stringify({error, loading})}</pre>
            <input
              value={this.state.emailAddress}
              onChange={({target: {value}}) =>
                this.setState({emailAddress: value})
              }
            />
            <button>Next</button>
          </form>
        }
      </Mutation>
    );
  }
}

class SignUp extends Component {
  state = {
    name: '',
    password: ''
  };

  render() {
    return (
      <Mutation
        mutation={gql`
          mutation($input: SignUpInput!) {
            signUp(input: $input) {
              user {
                id
              }
            }
          }
        `}
      >
        {(mutate, {error, loading}) =>
          <form
            onSubmit={ev => {
              ev.preventDefault();
              mutate({variables: {input: {...this.state, token: this.props.token}}});
            }}
          >
            <pre>{JSON.stringify({error, loading})}</pre>
            <input
              autoComplete='username'
              type='email'
              value={this.props.emailAddress}
              disabled
            /> (verified)
            <input
              autoComplete='name'
              type='text'
              value={this.state.name}
              onChange={({target: {value}}) => this.setState({name: value})}
            />
            <input
              autoComplete='new-password'
              type='password'
              value={this.state.password}
              onChange={({target: {value}}) => this.setState({password: value})}
            />
            <button>Finish</button>
          </form>
        }
      </Mutation>
    );
  }
}

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
      {({
        data: {userEmailAddress: {emailAddress} = {}} = {},
        error,
        loading
      } = {}) =>
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
