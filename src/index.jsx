import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import './index.css';
import ServerSideGrid from './ServerSideGrid.jsx';
import GraphiQLClient from './GraphiQL';
import { Nav, INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';

Amplify.configure(awsmobile);

const navLinkGroups: INavLinkGroup[] = [
  {
    name: 'Case Data',
    links: [
      { name: 'All Cases', url: '/cases' },
      {
        name: 'MDEC',
        expandAriaLabel: 'Expand Basic components section',
        collapseAriaLabel: 'Collapse Basic components section',
        links: [
          { name: 'MDEC Criminal Cases', url: '/odycrim' },
          { name: 'MDEC Traffic Cases', url: '/odytraf' },
          { name: 'MDEC Civil Citations', url: '/odycvcit' },
          { name: 'MDEC Civil Cases', url: '/odycivil' }
        ],
        isExpanded: true
      },
      {
        name: 'Non-MDEC',
        expandAriaLabel: 'Expand Basic components section',
        collapseAriaLabel: 'Collapse Basic components section',
        links: [
          { name: 'Circuit Court Civil Cases', url: '/cc' },
          { name: 'District Court Civil Cases', url: '/dscivil' },
          { name: 'District Court Criminal Cases', url: '/dscr' },
          { name: 'Baltimore City Criminal Cases', url: '/dsk8' },
          { name: 'District Court Traffic Cases', url: '/dstraf' }
        ],
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

export const NavBar: React.FunctionComponent = () => {
  return (
    <Nav onRenderGroupHeader={_onRenderGroupHeader} groups={navLinkGroups} />
  );
};

function _onRenderGroupHeader(group: INavLinkGroup): JSX.Element {
  return <h3>{group.name}</h3>;
}

ReactDOM.render(
  <Router>
    <div className="navbar">
      <NavBar />
    </div>
    <div className="content">
      <Route
        exact
        path="/"
        component={props => <ServerSideGrid table="cases" />}
      />
      <Route
        path="/cases"
        component={props => <ServerSideGrid table="cases" />}
      />
      <Route
        path="/dscr"
        page="dscr"
        component={props => <ServerSideGrid table="dscr" />}
      />
      <Route
        path="/dsk8"
        component={props => <ServerSideGrid table="dsk8" />}
      />
      <Route
        path="/dstraf"
        component={props => <ServerSideGrid table="dstraf" />}
      />
      <Route path="/cc" component={props => <ServerSideGrid table="cc" />} />
      <Route
        path="/dscivil"
        component={props => <ServerSideGrid table="dscivil" />}
      />
      <Route
        path="/odycrim"
        component={props => <ServerSideGrid table="odycrim" />}
      />
      <Route
        path="/odytraf"
        component={props => <ServerSideGrid table="odytraf" />}
      />
      <Route
        path="/odycvcit"
        component={props => <ServerSideGrid table="odycvcit" />}
      />
      <Route
        path="/odycivil"
        component={props => <ServerSideGrid table="odycivil" />}
      />
      <Route path="/graphql" component={GraphiQLClient} />
    </div>
  </Router>,
  document.getElementById('root')
);
