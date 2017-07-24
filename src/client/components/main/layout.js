import {Link, Route, Switch} from 'react-router-dom';
import {withPave} from 'pave-react';
import config from '../../config';
import cx from 'classnames';
import disk from '../../utils/disk';
import Home from '../home/layout';
import Logo from '../shared/logo';
import NotFound from '../shared/not-found';
import React from 'react';
import styles from './layout.scss';

const signInToken = ({props: {pave: {store}}}) => {
  store.run({query: ['signInToken!', prompt('Enter a token')]})
    .catch(er => console.error(er));
};

const signOut = ({props: {history, pave: {store}}}) =>
  store.run({query: ['signOut!']})
    .then(() => {
      store.update({$set: {user: store.get(['user'])}});
      history.push('/refresh');
    })
    .catch(er => console.error(er));

const signInGithub = () => {
  const githubState = Math.random().toString(36).slice(2);
  disk.set('githubState', githubState);
  location.assign(
    'http://github.com/login/oauth/authorize' +
      `?client_id=${config.github.clientId}` +
      `&state=${githubState}`
  );
};

const render = ({props, props: {pave: {error, isLoading, state: {user}}}}) =>
  <div>
    <div className={styles.header}>
      <div className={styles.left}>
        <Link className={cx(styles.logo, styles.link)} to='/'>
          <Logo className={styles.logoIcon} />
          <div className={styles.logoText}>Bob</div>
        </Link>
      </div>
      <div className={styles.center} />
      <div className={styles.right}>
        {
          user ?
            user.id === 'public' ?
            <div className={styles.dropdown}>
              <div className={styles.link}>Sign In</div>
              <div className={styles.options}>
                <div className={styles.link} onClick={signInGithub}>
                  with GitHub
                </div>
                <div className={styles.link} onClick={() => signInToken({props})}>
                  with a Token
                </div>
              </div>
            </div> :
            <div className={styles.dropdown}>
              <div className={styles.link} onClick={() => signOut({props})}>Sign Out</div>
            </div> :
          isLoading ? 'Loading...' :
          error ? error.message || error :
          'Something went wrong!'
        }
      </div>
    </div>
    <Switch>
      <Route exact path='/' component={Home} />
      <Route component={NotFound} />
    </Switch>
  </div>;

export default withPave(
  props => render({props}),
  {
    getQuery: () => ['user'],

    getState: ({store}) => ({
      user: store.get(['user'])
    })
  }
);
