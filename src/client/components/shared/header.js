import cx from 'classnames';
import styles from './header.scss';
import React from 'react';

export default ({children, className, ...rest}) =>
  <div {...rest} className={cx(styles.root, className)}>
    {children}
  </div>;
