import Icon from './icon';
import React from 'react';

export default ({error}) =>
  <div>
    <Icon name='exlamation-circle' />{' '}
    {error ? error.message || error : 'Error'}
  </div>;
