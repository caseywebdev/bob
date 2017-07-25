import _ from 'underscore';
import {Link} from 'react-router-dom';
import {withPave} from 'pave-react';
import ErrorComponent from '../shared/error';
import Header from '../shared/header';
import Loading from '../shared/loading';
import React from 'react';
import styles from './index.scss';
import SubHeader from '../shared/sub-header';

const renderEnv = ({env: {id, name, role}}) =>
  <div className={styles.env} key={id}>
    <SubHeader>{name}</SubHeader>
    <div><Link to={`/envs/${id}/update`}>Edit</Link></div>
    Role: {role}
  </div>;

const render = ({props: {pave: {error, isLoading, state: {envs}}}}) =>
  <div className={styles.root}>
    <Header>Envs</Header>
    <Link to='/envs/create'>+ New Env</Link>
    {
      envs ? _.map(envs, env => renderEnv({env})) :
      isLoading ? <Loading /> :
      <ErrorComponent error={error} />
    }
  </div>;

export default withPave(
  props => render({props}),
  {
    getQuery: () => ['envs'],

    getState: ({store}) => ({
      envs: store.get(['envs'])
    })
  }
);
