import Loading from '../shared/loading';
import React from 'react';
import SignIn from '../sign-in';

export default ({loading, viewer}) =>
  loading ? <Loading size='big' /> :
  viewer ? <pre>{JSON.stringify(viewer, null, 2)}</pre> :
  <SignIn />;
