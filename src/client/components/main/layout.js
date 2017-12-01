import {Link, Route, Switch} from 'react-router-dom';
import config from '../../config';
import B from '../shapes/b';
// import BuildsIndex from '../builds/index';
// import BuildsRead from '../builds/read';
// import config from '../../config';
// import disk from '../../constants/disk';
// import EnvsLayout from '../envs/layout';
// import ErrorComponent from '../shared/error';
// import Icon from '../shared/icon';
// import Loading from '../shared/loading';
import NotFound from '../shared/not-found';
// import React from 'react';
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

import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import React from 'react';
import styled, {css} from 'react-emotion';

const Root = styled('div')`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const Nav = styled('div')`
  display: flex;
  flex-direction: column;
  width: 40px;
`;

const bClass = css`
  fill: ${config.css.colors.darkGray};
  width: 20px;
`;

const NavItem = styled(Link)`
  align-items: center;
  color: ${config.css.colors.darkGray};
  cursor: pointer;
  display: flex;
  font-size: 20px;
  height: 40px;
  justify-content: center;
  text-decoration: none;

  &:hover {
    color: ${config.css.colors.bobOrange};

    .${bClass} {
      fill: ${config.css.colors.bobOrange};
    }
  }
`;

const Content = styled('div')`
  ${config.css.boxShadow}
  -webkit-overflow-scrolling: touch;
  flex: 1;
  overflow: auto;
  height: 100%;
  position: relative;
`;

const query = gql`
  query {
    echo(say: "foo")
    foo: builds {
      sha
    }
    builds {
      id
      repo
    }
  }
`;

const render = ({props}) =>
  <Root>
    <Nav>
      <NavItem to='/'><B className={bClass} /></NavItem>
      {/* {
        user ?
          user.id === 'public' ? [
            <div className={styles.navItem} key='0' onClick={signInGithub}>
              <Icon name='github' />
            </div>,
            <div
              className={styles.navItem}
              key='1'
              onClick={() => signInToken({props})}
            >
              <Icon name='key' />
            </div>
          ] : [
            <Link className={styles.navItem} key='0' to='/envs'>
              <Icon name='globe' />
            </Link>,
            <div
              className={styles.navItem}
              key='1'
              onClick={() => signOut({props})}
            >
              <Icon name='sign-out' />
            </div>
          ] :
          isLoading ? <div className={styles.navItem}><Loading /></div> :
        <ErrorComponent {...{error}} />
      } */}
    </Nav>
    <Content>
      <Switch>
        {/* <Route exact path='/' component={BuildsIndex} />
        <Route path='/builds/:id' component={BuildsRead} />
        <Route path='/envs' component={EnvsLayout} /> */}
        <Route component={NotFound} />
      </Switch>
    </Content>
  </Root>;

export default graphql(query)(props => render({props}));
