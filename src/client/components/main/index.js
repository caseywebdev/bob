import {Link, Route, Switch} from 'react-router-dom';
import B from '../shapes/b';
import createAsyncComponent from '../../functions/create-async-component';
import React from 'react';
import styles from './index.scss';

const Home = createAsyncComponent(() => import('./home'));
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
        <Route exact path='/' component={Home} />
        <Route component={NotFound} />
      </Switch>
    </div>
  </div>;
