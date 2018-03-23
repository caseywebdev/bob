import AsyncComponent from '../shared/async-component';
import Meta from '../shared/meta';
import React from 'react';

export default () =>
  <Meta title='GraphiQL'>
    <AsyncComponent importGetter={() => import('./index')} />
  </Meta>;
