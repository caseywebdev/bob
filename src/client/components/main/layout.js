import {Link, Route, Switch} from 'react-router-dom';
import {withPave} from 'pave-react';
import config from '../../config';
import disk from '../../utils/disk';
import BuildsIndex from '../builds/index';
import BuildsRead from '../builds/read';
import Icon from '../shared/icon';
import Loading from '../shared/loading';
import Bob from '../shapes/bob';
import NotFound from '../shared/not-found';
import React from 'react';
import EnvsLayout from '../envs/layout';
import styles from './layout.scss';

const signInToken = ({props: {pave: {store}}}) => {
  const token = prompt('Token');
  if (!token) return;

  store
    .run({query: ['signInToken!', token]})
    .catch(er => console.error(er));
};

const signOut = ({props: {history, pave: {store}}}) =>
  store
    .run({query: ['signOut!']})
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
        <Link className={styles.bob} to='/'>
          <Bob className={styles.bobShape} />
        </Link>
      </div>
      <div className={styles.center} />
      <div className={styles.right}>
        {
          user ?
            user.id === 'public' ?
            <div className={styles.dropdown}>
              <div className={styles.link}><Icon name='sign-in' /> Sign In</div>
              <div className={styles.options}>
                <div className={styles.link} onClick={signInGithub}>
                  <Icon name='github' /> with GitHub
                </div>
                <div
                  className={styles.link}
                  onClick={() => signInToken({props})}
                >
                  <Icon name='key' /> with a Token
                </div>
              </div>
            </div> :
            <div className={styles.dropdown}>
              <div className={styles.link}>
                <Icon name='user' /> {user.name}
              </div>
              <div className={styles.options}>
                <Link className={styles.link} to='/envs'>
                  <Icon name='globe' /> Envs
                </Link>
                <div className={styles.link} onClick={() => signOut({props})}>
                  <Icon name='sign-out' /> Sign Out
                </div>
              </div>
            </div> :
          isLoading ? <Loading className={styles.loading} /> :
          error ? error.message || error :
          'Something went wrong!'
        }
      </div>
    </div>
    <Switch>
      <Route exact path='/' component={BuildsIndex} />
      <Route path='/builds/:id' component={BuildsRead} />
      <Route path='/envs' component={EnvsLayout} />
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
