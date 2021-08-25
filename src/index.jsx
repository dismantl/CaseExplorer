import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import './index.css';
import ServerSideGrid from './ServerSideGrid';
import GraphiQLClient from './GraphiQL';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import environment from './config';
import { checkStatus, toTitleCase } from './utils';
import { API } from 'aws-amplify';
import Header from './Header';
import NavBar, { genNavStructure } from './Nav';
import apiName from './ApiName';

// export const apiName = 'caseexplorerapi';
export const version = '0.1';

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
  let routes = [];
  for (const [root_table, table_metadata] of Object.entries(metadata.tables)) {
    routes.push(
      <Route path={'/' + root_table} key={'/' + root_table}>
        <ServerSideGrid metadata={metadata.columns} table={root_table} />
      </Route>
    );
    for (const table of table_metadata.subtables) {
      routes.push(
        <Route path={'/' + table} key={'/' + table}>
          <ServerSideGrid metadata={metadata.columns} table={table} />
        </Route>
      );
    }
  }
  routes = routes.concat([
    <Route path="/bpd/:seq" key="/bpd/:seq">
      <ServerSideGrid byCop metadata={metadata.columns} table="dscr" />
    </Route>,
    <Route path="/cases" key="/cases">
      <ServerSideGrid metadata={metadata.columns} table="cases" />
    </Route>,
    <Route path="/" key="/">
      <ServerSideGrid metadata={metadata.columns} table="cases" />
    </Route>
  ]);

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
        title += root_table_obj.description + ': ';
      }
    }
    title += toTitleCase(table.substring(table.indexOf('_') + 1));
  }
  return title;
};

const renderMain = (title, routes) => {
  ReactDOM.render(
    <Router>
      <Header title={title} version={version} />
      <div className="navbar">
        <NavBar />
      </div>
      <div className="content">
        <Switch>
          <Route path="/graphql" component={GraphiQLClient} />
          {routes}
        </Switch>
      </div>
    </Router>,
    document.getElementById('root')
  );
};

initializeIcons();
ReactDOM.render(
  <div className="loader-container">
    <div className="loader"></div>
  </div>,
  document.getElementById('root')
);
fetchMetadata(metadata => {
  const routes = genRoutes(metadata);
  genNavStructure(metadata);
  if (!window.location.pathname.startsWith('/bpd')) {
    const title = getTitle(metadata);
    renderMain(title, routes);
  } else {
    const seq_number = window.location.href.substring(
      window.location.href.lastIndexOf('/') + 1
    );
    const path = `/api/bpd/label/${seq_number}`;
    let promise;
    if (environment === 'development') {
      promise = fetch(path)
        .then(checkStatus)
        .then(httpResponse => httpResponse.json());
    } else {
      promise = API.get(apiName, path);
    }
    promise
      .then(response => {
        renderMain(response, routes);
      })
      .catch(error => {
        console.error(error);
        return;
        // TODO report error to user
      });
  }
});
