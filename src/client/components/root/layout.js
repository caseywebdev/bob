import {ApolloProvider} from 'react-apollo';
import {Route, Router, Switch} from 'react-router-dom';
import apolloClient from '../../constants/apollo-client';
import GraphiQL from '../graphiql/layout';
import history from '../../constants/history';
import MainLayout from '../main/layout';
import Meta from '../shared/meta';
import React from 'react';
import SignUp from '../sign-up';

export default () =>
  <ApolloProvider client={apolloClient}>
    <Router {...{history}}>
      <Meta title='Bob'>
        <Switch>
          <Route exact path='/sign-up' component={SignUp} />
          <Route exact path='/graphiql' component={GraphiQL} />
          <Route component={MainLayout} />
        </Switch>
      </Meta>
    </Router>
  </ApolloProvider>;
