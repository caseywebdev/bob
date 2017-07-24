import {Route, Switch} from 'react-router-dom';
import Index from './index';
import Update from './update';
import NotFound from '../shared/not-found';
import Meta from '../shared/meta';
import React from 'react';

export default () =>
  <Meta title='Envs'>
    <Switch>
      <Route exact path='/envs' component={Index} />
      <Route exact path='/envs/:id/update' component={Update} />
      <Route component={NotFound} />
    </Switch>
  </Meta>;
