import cx from 'classnames';
import React from 'react';

export default ({className, name}) =>
  <span className={cx('fa', `fa-${name}`, className)} />;
