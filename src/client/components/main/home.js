import Loading from '../shared/loading';
import Notice from '../shared/notice';
import React from 'react';
import SignIn from '../sign-in';

export default ({error, loading, viewer}) =>
  loading ? <Loading size='large' /> :
  error ? <Notice type='error'>{error.toString()}</Notice> :
  viewer ? <pre>{JSON.stringify(viewer, null, 2)}</pre> :
  <SignIn />;
