import React, { Component, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import './index.css';
import ServerSideGrid from './ServerSideGrid.jsx';
import GraphiQLClient from './GraphiQL';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import environment from './config';
import { checkStatus, toTitleCase } from './utils';
import { API } from 'aws-amplify';
import Header from './Header.jsx';
import NavBar, { genNavStructure } from './Nav.jsx';

const apiName = 'caseexplorerapi';

Amplify.configure(awsmobile);

const fetchMetadata = callback => {
  var promise;
  if (environment === 'development') {
    promise = fetch('/api/metadata')
      .then(checkStatus)
      .then(httpResponse => httpResponse.json());
  } else {
    promise = API.get(apiName, '/api/metadata');
  }
  promise.then(metadata => {
    callback(metadata);
  });
};

const genRoutes = metadata => {
  let routes = [
    <Route
      exact
      path="/"
      component={props => (
        <ServerSideGrid
          apiName={apiName}
          metadata={metadata.columns}
          table="cases"
        />
      )}
    />,
    <Route
      exact
      path="/cases"
      component={props => (
        <ServerSideGrid
          apiName={apiName}
          metadata={metadata.columns}
          table="cases"
        />
      )}
    />
  ];

  for (const [root_table, table_metadata] of Object.entries(metadata.tables)) {
    routes.push(
      <Route
        exact
        path={'/' + root_table}
        component={props => (
          <ServerSideGrid
            apiName={apiName}
            metadata={metadata.columns}
            table={root_table}
          />
        )}
      />
    );
    for (const table of table_metadata.subtables) {
      routes.push(
        <Route
          exact
          path={'/' + table}
          component={props => (
            <ServerSideGrid
              apiName={apiName}
              metadata={metadata.columns}
              table={table}
            />
          )}
        />
      );
    }
  }

  return routes;
};

const getTitle = metadata => {
  const table = window.location.href.substring(
    window.location.href.lastIndexOf('/') + 1
  );
  let title = '';
  if (table === '' || table === 'cases') {
    title = 'All Cases';
  } else if (metadata.tables[table] != null) {
    title = metadata.tables[table].description;
  } else {
    for (const [root_table, root_table_obj] of Object.entries(
      metadata.tables
    )) {
      if (root_table_obj.subtables.includes(table)) {
        console.log(root_table_obj.description);
        title += root_table_obj.description + ': ';
      }
    }
    title += toTitleCase(table.substring(table.indexOf('_') + 1));
  }
  return title;
};

initializeIcons();
ReactDOM.render(
  <div className="loader-container">
    <div className="loader"></div>
  </div>,
  document.getElementById('root')
);
fetchMetadata(metadata => {
  genNavStructure(metadata);
  const routes = genRoutes(metadata);
  const title = getTitle(metadata);

  ReactDOM.render(
    <Router>
      <Header title={title} />
      <div className="navbar">
        <NavBar />
      </div>
      <div className="content">
        {routes}
        <Route path="/graphql" component={GraphiQLClient} />
      </div>
    </Router>,
    document.getElementById('root')
  );
});
