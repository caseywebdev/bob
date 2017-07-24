import cx from 'classnames';
import Icon from './icon';
import React from 'react';

export default ({className, ...rest}) =>
  <Icon {...rest} className={cx('fa-spin', className)} name='refresh' />;
