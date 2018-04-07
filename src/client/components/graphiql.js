import 'graphiql/graphiql.css';
import disk from '../constants/disk';
import GraphiQL from 'graphiql';
import Meta from './shared/meta';
import React from 'react';

const fetcher = body => {
  const token = disk.get('token');
  const headers = {'Content-Type': 'application/json'};
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch('/api/graphql', {
    body: JSON.stringify(body),
    headers: headers,
    method: 'POST'
  }).then(res => res.text()).then(message => {
    const errors = [{message}];
    try { return JSON.parse(message); } catch (er) { return {errors}; }
  });
};

export default () =>
  <Meta title='GraphiQL'>
    <GraphiQL {...{fetcher}} />
  </Meta>;
