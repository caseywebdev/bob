import {Link, Route, Switch} from 'react-router-dom';
import AsyncComponent from '../shared/async-component';
import B from '../shapes/b';
import NotFound from '../shared/not-found';
import React from 'react';
import styles from './layout.scss';

export default () =>
  <div className={styles.root}>
    <div className={styles.nav}>
      <Link className={styles.navItem} to='/'>
        <B className={styles.bShape} />
      </Link>
    </div>
    <div className={styles.content}>
      <Switch>
        <Route
          exact
          path='/'
          render={props =>
            <AsyncComponent
              {...props}
              importGetter={() => import('./index')}
            />
          }
        />
        <Route component={NotFound} />
      </Switch>
    </div>
  </div>;
