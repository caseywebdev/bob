import React from 'react';
import styles from './loading.scss';

export default ({size}) =>
  <div className={styles[`size-${size}`]}><div /><div /><div /></div>;
