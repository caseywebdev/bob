import 'graphiql/graphiql.css';
import GraphiQL from 'graphiql';
import React from 'react';

const fetcher = body =>
  fetch('/api/graphql', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  }).then(response => response.json());

export default () => <GraphiQL fetcher={fetcher} />;
