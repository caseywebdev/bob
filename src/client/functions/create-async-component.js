import AsyncComponent from '../components/shared/async-component';
import React from 'react';

export default importComponent => componentProps =>
  <AsyncComponent {...{componentProps, importComponent}} />;
