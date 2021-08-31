import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import './index.css';
import ServerSideGrid from './ServerSideGrid';
import GraphiQLClient from './GraphiQL';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import environment from './config';
import { checkStatus, toTitleCase, getURLLastPart } from './utils';
import { API } from 'aws-amplify';
import Header from './Header';
import NavBar, { genNavStructure } from './Nav';
import apiName from './ApiName';
import { useEffect } from 'react';

export const version = '0.2';

Amplify.configure(awsmobile);

const fetchMetadata = callback => {
  let promise;
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

const getTitle = metadata => {
  const table = getURLLastPart();
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

const genRoutes = metadata => {
  let routes = [];
  if (metadata) {
    for (const [root_table, table_metadata] of Object.entries(
      metadata.tables
    )) {
      routes.push(
        <Route path={'/' + root_table} key={'/' + root_table}>
          <ServerSideGrid metadata={metadata} table={root_table} />
        </Route>
      );
      for (const table of table_metadata.subtables) {
        routes.push(
          <Route path={'/' + table} key={'/' + table}>
            <ServerSideGrid metadata={metadata} table={table} />
          </Route>
        );
      }
    }
    routes = routes.concat([
      <Route path="/bpd/:seq" key="/bpd/:seq">
        <ServerSideGrid byCop metadata={metadata} table="cases" />
      </Route>,
      <Route path="/cases" key="/cases">
        <ServerSideGrid metadata={metadata} table="cases" />
      </Route>,
      <Route path="/" key="/">
        <ServerSideGrid metadata={metadata} table="cases" />
      </Route>
    ]);
  }
  return routes;
};

const App = props => {
  const [metadata, setMetadata] = useState(null);
  const [title, setTitle] = useState('Case Explorer');

  useEffect(() => {
    fetchMetadata(res => {
      setMetadata(res);
      genNavStructure(res);
      if (!window.location.pathname.startsWith('/bpd')) {
        setTitle(getTitle(res));
      } else {
        const seq_number = getURLLastPart();
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
            setTitle(response);
          })
          .catch(error => {
            console.error(error);
            return;
            // TODO report error to user
          });
      }
    });
  }, []);

  if (!metadata) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  } else {
    return (
      <>
        <Router>
          <Header title={title} version={version} />
          <div className="navbar">
            <NavBar />
          </div>
          <div className="content">
            <Switch>
              <Route path="/graphql" component={GraphiQLClient} />
              {genRoutes(metadata)}
            </Switch>
          </div>
        </Router>
      </>
    );
  }
};

initializeIcons();
ReactDOM.render(<App />, document.getElementById('root'));
