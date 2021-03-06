import cx from 'classnames';
import React from 'react';
import styles from './header.scss';

export default ({children, className, ...rest}) =>
  <div {...rest} className={cx(styles.root, className)}>
    {children}
  </div>;
