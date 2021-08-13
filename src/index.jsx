import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import './index.css';
import ServerSideGrid from './ServerSideGrid.jsx';
import GraphiQLClient from './GraphiQL';
import { Nav, INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import environment from './config';
import { checkStatus, toTitleCase } from './utils';
import { API } from 'aws-amplify';

const apiName = 'caseexplorerapi';

Amplify.configure(awsmobile);

let navLinkGroups: INavLinkGroup[] = [
  {
    name: 'Case Data',
    links: [
      { name: 'All Cases', url: '/cases' },
      {
        name: 'MDEC',
        expandAriaLabel: 'Expand section',
        collapseAriaLabel: 'Collapse section',
        isExpanded: true,
        links: []
      },
      {
        name: 'Non-MDEC',
        expandAriaLabel: 'Expand section',
        collapseAriaLabel: 'Collapse section',
        links: [],
        isExpanded: true
      }
    ],
    isExpanded: true
  },
  {
    name: 'API',
    links: [
      { name: 'GraphQL', url: '/graphql' },
      {
        name: 'REST',
        url: 'https://portal.mdcaseexplorer.com',
        target: '_blank'
      }
    ],
    isExpanded: false
  }
];

const genNavItem = (metadata, table) => {
  const table_metadata = metadata[table];
  let links = [{ name: 'Overview', url: '/' + table }];
  for (const subtable of table_metadata.subtables) {
    const label = toTitleCase(subtable.replace(/^[^_]+_/, ''));
    links.push({ name: label, url: '/' + subtable });
  }
  return {
    name: table_metadata.description,
    expandAriaLabel: 'Expand section',
    collapseAriaLabel: 'Collapse section',
    links: links
  };
};

const genNavStructure = metadata => {
  // MDEC
  navLinkGroups[0].links[1].links = [
    genNavItem(metadata.tables, 'odycrim'),
    genNavItem(metadata.tables, 'odytraf'),
    genNavItem(metadata.tables, 'odycivil'),
    genNavItem(metadata.tables, 'odycvcit')
  ];
  // non-MDEC
  navLinkGroups[0].links[2].links = [
    genNavItem(metadata.tables, 'dscr'),
    genNavItem(metadata.tables, 'dsk8'),
    genNavItem(metadata.tables, 'dstraf'),
    genNavItem(metadata.tables, 'dscivil'),
    genNavItem(metadata.tables, 'cc')
  ];
};

export const NavBar: React.FunctionComponent = () => {
  return (
    <Nav
      onRenderGroupHeader={_onRenderGroupHeader}
      groups={navLinkGroups}
      styles={props => ({
        chevronIcon: {
          transform: props.isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
        }
      })}
    />
  );
};

function _onRenderGroupHeader(group: INavLinkGroup): JSX.Element {
  return <h3>{group.name}</h3>;
}

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

initializeIcons();
fetchMetadata(metadata => {
  genNavStructure(metadata);
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
  ReactDOM.render(
    <Router>
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
