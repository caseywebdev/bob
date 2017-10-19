import {Route, Router, Switch} from 'react-router-dom';

import history from '../../constants/history';
import MainLayout from '../main/layout';
import Meta from '../shared/meta';
import React from 'react';
import Refresh from './refresh';
import SignInGithub from '../sign-in/github';

const render = () =>
  <Router {...{history}}>
    <Meta title='Bob'>
      <Switch>
        <Route exact path='/sign-in/github' component={SignInGithub} />
        <Route exact path='/refresh' component={Refresh} />
        <Route component={MainLayout} />
      </Switch>
    </Meta>
  </Router>;

export default withPave(props => render({props}), {store});
