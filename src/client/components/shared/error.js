import Icon from './icon';
import React from 'react';
import styles from './error.scss';

export default ({error}) =>
  <div className={styles.root}>
    <div className={styles.left}><Icon name='exclamation-circle' /></div>
    <div className={styles.right}>
      {error ? error.message || error : 'Error'}
    </div>
  </div>;
