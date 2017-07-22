import {Route, Switch} from 'react-router-dom';
import {Router} from 'react-router-dom';
import {withPave} from 'pave-react';
import AuthGithub from '../auth/github';
import history from '../../utils/history';
import MainLayout from '../main/layout';
import Meta from '../shared/meta';
import React from 'react';
import store from '../../utils/store';

const render = () =>
  <Router {...{history}}>
    <Meta title='Bob'>
      <Switch>
        <Route exact path='/auth/github' component={AuthGithub} />
        <Route component={MainLayout} />
      </Switch>
    </Meta>
  </Router>;

export default withPave(props => render({props}), {store});
