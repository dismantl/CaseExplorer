import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import './index.css';
import Cases from './Cases';
import Dscr from './DSCR';
import Dsk8 from './DSK8';
import Cc from './CC';
import Dscivil from './DSCIVIL';
import Odycrim from './ODYCRIM';
import Odytraf from './ODYTRAF';
import GraphiQLClient from './GraphiQL';
import { Nav, INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';

Amplify.configure(awsmobile);

const navLinkGroups: INavLinkGroup[] = [
  {
    name: 'Case Data',
    links: [
      { name: 'All Cases', url: '/cases' },
      {
        name: 'Non-MDEC',
        expandAriaLabel: 'Expand Basic components section',
        collapseAriaLabel: 'Collapse Basic components section',
        links: [
          { name: 'Circuit Court Civil Cases', url: '/cc' },
          { name: 'District Court Civil Cases', url: '/dscivil' },
          { name: 'District Court Criminal Cases', url: '/dscr' },
          { name: 'Baltimore City Criminal Cases', url: '/dsk8' }
        ],
        isExpanded: true
      },
      {
        name: 'MDEC',
        expandAriaLabel: 'Expand Basic components section',
        collapseAriaLabel: 'Collapse Basic components section',
        links: [
          { name: 'MDEC Criminal Cases', url: '/odycrim' },
          { name: 'MDEC Traffic Cases', url: '/odytraf' }
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
      <Route exact path="/" component={Cases} />
      <Route path="/cases" component={Cases} />
      <Route path="/dscr" component={Dscr} />
      <Route path="/dsk8" component={Dsk8} />
      <Route path="/cc" component={Cc} />
      <Route path="/dscivil" component={Dscivil} />
      <Route path="/odycrim" component={Odycrim} />
      <Route path="/odytraf" component={Odytraf} />
      <Route path="/graphql" component={GraphiQLClient} />
    </div>
  </Router>,
  document.getElementById('root')
);
