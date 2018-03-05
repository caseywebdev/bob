import {ApolloProvider} from 'react-apollo';
import {Route, Router, Switch} from 'react-router-dom';
import apolloClient from '../../constants/apollo-client';
import GraphiQL from '../graphiql/layout';
import history from '../../constants/history';
import MainLayout from '../main/layout';
import Meta from '../shared/meta';
import React from 'react';
import VerifyEmailAddress from '../verify-email-address';

export default () =>
  <ApolloProvider client={apolloClient}>
    <Router {...{history}}>
      <Meta title='Bob'>
        <Switch>
          <Route exact path='/email-addresses/:emailAddressId/verify/:token' component={VerifyEmailAddress} />
          <Route exact path='/graphiql' component={GraphiQL} />
          <Route component={MainLayout} />
        </Switch>
      </Meta>
    </Router>
  </ApolloProvider>;
