import React, { Component } from 'react';
import { getTheme, mergeStyleSets, FontWeights, Modal } from '@fluentui/react';
import { IconButton } from '@fluentui/react/lib/Button';

const theme = getTheme();
const cancelIcon = { iconName: 'Cancel' };
const iconButtonStyles = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px'
  },
  rootHovered: {
    color: theme.palette.neutralDark
  }
};
const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch'
  },
  header: [
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      borderTop: `4px solid ${theme.palette.themePrimary}`,
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '12px 12px 14px 24px'
    }
  ],
  body: {
    flex: '4 4 auto',
    padding: '0 24px 24px 24px',
    overflowY: 'hidden',
    selectors: {
      p: {
        margin: '14px 0',
        'max-width': '1000px',
        'line-height': '1.5em'
      },
      'p:first-child': { marginTop: 0 },
      'p:last-child': { marginBottom: 0 }
    }
  }
});

// export const AboutModal = () => {
export default class AboutModal extends Component {
  toggleModal = () => {
    this.props.onToggle();
  };

  render() {
    return (
      <div>
        <Modal
          titleAriaId="about"
          isOpen={this.props.open}
          onDismiss={this.toggleModal}
          isBlocking={false}
          containerClassName={contentStyles.container}
        >
          <div className={contentStyles.header}>
            <span id="about">About</span>
            <IconButton
              styles={iconButtonStyles}
              iconProps={cancelIcon}
              ariaLabel="Close popup"
              onClick={this.toggleModal}
            />
          </div>
          <div className={contentStyles.body}>
            <p>
              Case Explorer is a web application and set of APIs for exploring
              data scraped from the{' '}
              <a
                target="_blank"
                href="https://casesearch.courts.state.md.us/casesearch/inquiry-index.jsp"
              >
                Maryland Judiciary Case Search
              </a>{' '}
              by{' '}
              <a
                target="_blank"
                href="https://github.com/dismantl/CaseHarvester"
              >
                Case Harvester
              </a>
              . The aim is to make an intuitive, easy-to-use Excel-like
              interface for browsing and searching through MD case data. Both
              REST and GraphQL APIs are available.
            </p>
            <p>
              Case Explorer is a project of{' '}
              <a target="_blank" href="https://openjusticebaltimore.org/">
                Open Justice Baltimore
              </a>{' '}
              and is built with 100% volunteer power. However, hosting this
              database is quite expensive.{' '}
              <a
                target="_blank"
                href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=K2NTTKHJ58FRA"
              >
                Please consider donating
              </a>{' '}
              to help us continue to make this resource available for
              resesarchers and the public.
            </p>
          </div>
        </Modal>
      </div>
    );
  }
}
