import React from 'react';
import GraphiQL from 'graphiql';
import { API } from 'aws-amplify';
import '../node_modules/graphiql/graphiql.css';

export default function GraphiQLClient(props) {
  return (
    <div style={{ height: '95vh' }}>
      <GraphiQL fetcher={graphQLParams => API.graphql(graphQLParams)} />
    </div>
  );
}
