import Loading from '../shared/loading';
import Notice from '../shared/notice';
import React from 'react';
import {Link} from 'react-router-dom';

export default ({error, loading, viewer}) =>
  loading ? <Loading size='large' /> :
  error ? <Notice type='error'>{error.toString()}</Notice> :
  viewer ? <pre>{JSON.stringify(viewer, null, 2)}</pre> :
  <Link to='/sign-in'>Sign In</Link>;
