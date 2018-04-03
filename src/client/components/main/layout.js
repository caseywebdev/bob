import {Link, Route, Switch} from 'react-router-dom';
import B from '../shapes/b';
import createAsyncComponent from '../../functions/create-async-component';
import React from 'react';
import styles from './layout.scss';

const Index = createAsyncComponent(() => import('./index'));
const NotFound = createAsyncComponent(() => import('../shared/not-found'));

export default () =>
  <div className={styles.root}>
    <div className={styles.nav}>
      <Link className={styles.navItem} to='/'>
        <B className={styles.bShape} />
      </Link>
    </div>
    <div className={styles.content}>
      <Switch>
        <Route exact path='/' component={Index} />
        <Route component={NotFound} />
      </Switch>
    </div>
  </div>;
