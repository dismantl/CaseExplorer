import React from 'react';
import { Nav, INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';
import { toTitleCase, getURLLastPart } from './utils';
import CopFinder from './CopFinder';
import apiName from './ApiName';
import { mergeStyleSets, Text } from '@fluentui/react';
import { FontIcon } from '@fluentui/react/lib/Icon';
import {
  TooltipHost,
  TooltipDelay,
  DirectionalHint,
  ITooltipProps
} from '@fluentui/react';

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
        isExpanded: false
      }
    ],
    isExpanded: true
  },
  {
    name: 'Search By BPD Officer',
    key: 'Search By BPD Officer'
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

const genNavItem = (metadata, currentTable, table) => {
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
    links: links,
    isExpanded: table === currentTable ? true : false
  };
};

export const genNavStructure = metadata => {
  let currentTable = getURLLastPart();
  if (currentTable.indexOf('_') !== -1)
    currentTable = currentTable.substring(0, currentTable.indexOf('_'));
  navLinkGroups[0].links[2].isExpanded =
    currentTable === '' || currentTable.substring(0, 3) === 'ody'
      ? false
      : true;
  // MDEC
  navLinkGroups[0].links[1].links = [
    genNavItem(metadata.tables, currentTable, 'odycrim'),
    genNavItem(metadata.tables, currentTable, 'odytraf'),
    genNavItem(metadata.tables, currentTable, 'odycivil'),
    genNavItem(metadata.tables, currentTable, 'odycvcit')
  ];
  // non-MDEC
  navLinkGroups[0].links[2].links = [
    genNavItem(metadata.tables, currentTable, 'dscr'),
    genNavItem(metadata.tables, currentTable, 'k'),
    genNavItem(metadata.tables, currentTable, 'dstraf'),
    genNavItem(metadata.tables, currentTable, 'dscivil'),
    genNavItem(metadata.tables, currentTable, 'cc'),
    genNavItem(metadata.tables, currentTable, 'dscp'),
    genNavItem(metadata.tables, currentTable, 'dsk8'),
    genNavItem(metadata.tables, currentTable, 'pg'),
    genNavItem(metadata.tables, currentTable, 'dv')
  ];
};

const NavBar: React.FunctionComponent = props => {
  function _onRenderGroupHeader(group: INavLinkGroup): JSX.Element {
    if (group.name !== 'Search By BPD Officer') return <h3>{group.name}</h3>;
    return (
      <>
        <h3>{group.name}</h3>
        <CopFinder apiName={apiName} />
      </>
    );
  }

  function _onRenderLink(link) {
    if (link.name === 'MDEC') {
      return (
        <>
          <span className={styles.mdec}>MDEC</span>
          <TooltipHost
            tooltipProps={tooltipProps}
            delay={TooltipDelay.zero}
            directionalHint={DirectionalHint.rightCenter}
            className={styles.tooltip}
          >
            <FontIcon
              aria-label="MDEC"
              iconName="Info"
              className={styles.icon}
            />
          </TooltipHost>
        </>
      );
    }
    return link.name;
  }

  return (
    <Nav
      onRenderGroupHeader={_onRenderGroupHeader}
      onRenderLink={_onRenderLink}
      groups={navLinkGroups}
      styles={props => ({
        chevronIcon: {
          transform: props.isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
        }
      })}
    />
  );
};
export default NavBar;

const styles = mergeStyleSets({
  tooltip: {
    lineHeight: '1.4',
    padding: '20px'
  },
  mdec: {
    margin: '0 4px'
  },
  icon: {
    margin: '0 4px',
    fontSize: '16px',
    position: 'relative',
    top: '2px'
  }
});

const tooltipProps: ITooltipProps = {
  onRenderContent: () => (
    <Text block variant="medium">
      <a target="_blank" href="https://mdcourts.gov/mdec/about">
        Maryland Electronic Courts (MDEC)
      </a>{' '}
      is a single Judiciary-wide integrated case management system that will be
      used by all the courts in the state court system.
    </Text>
  )
};
