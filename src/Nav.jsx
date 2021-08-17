import React, { Component, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';
import { checkStatus, toTitleCase } from './utils';

let navLinkGroups: INavLinkGroup[] = [
  {
    name: 'Case Data',
    key: 'Case Data',
    links: [
      { name: 'All Cases', url: '/', key: 'cases' },
      {
        name: 'MDEC',
        key: 'MDEC',
        expandAriaLabel: 'Expand section',
        collapseAriaLabel: 'Collapse section',
        isExpanded: true,
        links: []
      },
      {
        name: 'Non-MDEC',
        key: 'Non-MDEC',
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
    key: 'API',
    links: [
      { name: 'GraphQL', url: '/graphql', key: 'graphql' },
      {
        name: 'REST',
        key: 'REST',
        url: 'https://portal.mdcaseexplorer.com',
        target: '_blank'
      }
    ],
    isExpanded: false
  }
];

const genNavItem = (metadata, table) => {
  const table_metadata = metadata[table];
  let links = [{ name: 'Overview', url: '/' + table, key: table }];
  for (const subtable of table_metadata.subtables) {
    const label = toTitleCase(subtable.replace(/^[^_]+_/, ''));
    links.push({
      name: label,
      url: '/' + subtable,
      key: subtable
    });
  }
  return {
    name: table_metadata.description,
    expandAriaLabel: 'Expand section',
    collapseAriaLabel: 'Collapse section',
    links: links
  };
};

export const genNavStructure = metadata => {
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

const NavBar: React.FunctionComponent = () => {
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

export default NavBar;
