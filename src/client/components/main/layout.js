// import config from '../../config';
// import disk from '../../constants/disk';
// import ErrorComponent from '../shared/error';
// import Icon from '../shared/icon';
// import Loading from '../shared/loading';
import {graphql} from 'react-apollo';
import {Link, Route, Switch} from 'react-router-dom';
import B from '../shapes/b';
// import BuildsIndex from '../builds/index';
// import BuildsRead from '../builds/read';
// import EnvsLayout from '../envs/layout';
import gql from 'graphql-tag';
import NotFound from '../shared/not-found';
import React from 'react';
import styles from './layout.scss';
//
// const signInToken = ({props: {pave: {store}}}) => {
//   const token = prompt('Token');
//   if (!token) return;
//
//   store
//     .run({query: ['signInToken!', token]})
//     .catch(er => console.error(er));
// };
//
// const signOut = ({props: {history, pave: {store}}}) =>
//   store
//     .run({query: ['signOut!']})
//     .then(() => {
//       store.update({$set: {user: store.get(['user'])}});
//       history.push('/refresh');
//     })
//     .catch(er => console.error(er));
//
// const signInGithub = () => {
//   const githubState = Math.random().toString(36).slice(2);
//   disk.set('githubState', githubState);
//   location.assign(
//     'http://github.com/login/oauth/authorize' +
//       `?client_id=${config.github.clientId}` +
//       `&state=${githubState}`
//   );
// };

const query = gql`
  query {
    viewer {
      id
      name
      userTokens {
        id
      }
    }
  }
`;

// {/* {
//   user ?
//     user.id === 'public' ? [
//       <div className={styles.navItem} key='0' onClick={signInGithub}>
//         <Icon name='github' />
//       </div>,
//       <div
//         className={styles.navItem}
//         key='1'
//         onClick={() => signInToken({props})}
//       >
//         <Icon name='key' />
//       </div>
//     ] : [
//       <Link className={styles.navItem} key='0' to='/envs'>
//         <Icon name='globe' />
//       </Link>,
//       <div
//         className={styles.navItem}
//         key='1'
//         onClick={() => signOut({props})}
//       >
//         <Icon name='sign-out' />
//       </div>
//     ] :
//     isLoading ? <div className={styles.navItem}><Loading /></div> :
//   <ErrorComponent {...{error}} />
// } */}

const render = ({props}) =>
  <div className={styles.root}>
    <div className={styles.nav}>
      <Link className={styles.navItem} to='/'>
        <B className={styles.bShape} />
      </Link>
    </div>
    <div className={styles.content}>
      <pre>{JSON.stringify(props.data, null, 2)}</pre>
      <Switch>
        <Route component={NotFound} />
      </Switch>
    </div>
  </div>;
  // <Route exact path='/' component={BuildsIndex} />
  // <Route path='/builds/:id' component={BuildsRead} />
  // <Route path='/envs' component={EnvsLayout} />

export default graphql(query)(props => render({props}));
