import cx from 'classnames';
import Icon from './icon';
import React from 'react';
import styles from './notice.scss';

const ICONS = {
  error: <Icon name='exclamation-circle' />
};

export default ({children, type}) =>
  <div className={cx(styles.root, styles[`type-${type}`])}>
    <div className={styles.left}>{ICONS[type]}</div>
    <div className={styles.right}>{children}</div>
  </div>;
