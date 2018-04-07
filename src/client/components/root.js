import {ApolloProvider} from 'react-apollo';
import {Route, Router, Switch} from 'react-router-dom';
import apolloClient from '../constants/apollo-client';
import createAsyncComponent from '../functions/create-async-component';
import history from '../constants/history';
import Meta from './shared/meta';
import React from 'react';

const GraphiQL = createAsyncComponent(() => import('./graphiql'));
const Main = createAsyncComponent(() => import('./main'));
const SignUp = createAsyncComponent(() => import('./sign-up'));

export default () =>
  <ApolloProvider client={apolloClient}>
    <Router {...{history}}>
      <Meta title='Bob'>
        <Switch>
          <Route exact path='/sign-up' component={SignUp} />
          <Route exact path='/graphiql' component={GraphiQL} />
          <Route component={Main} />
        </Switch>
      </Meta>
    </Router>
  </ApolloProvider>;
