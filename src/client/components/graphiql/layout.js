import AsyncComponent from '../shared/async-component';
import Meta from '../shared/meta';
import React from 'react';

export default () =>
  <Meta title='GraphiQL'>
    <AsyncComponent loader={() => import('./index')} />
  </Meta>;
