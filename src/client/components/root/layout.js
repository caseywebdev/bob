import {ApolloProvider} from 'react-apollo';
import {Route, Router, Switch} from 'react-router-dom';
import apolloClient from '../../constants/apollo-client';
import history from '../../constants/history';
import MainLayout from '../main/layout';
import Meta from '../shared/meta';
import React from 'react';
// import SignInGithub from '../sign-in/github';

export default () =>
  <ApolloProvider client={apolloClient}>
    <Router {...{history}}>
      <Meta title='Bob'>
        <Switch>
          {/* <Route exact path='/sign-in/github' component={SignInGithub} /> */}
          <Route component={MainLayout} />
        </Switch>
      </Meta>
    </Router>
  </ApolloProvider>;
