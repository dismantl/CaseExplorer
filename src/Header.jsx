import React, { useState } from 'react';
import AboutModal from './AboutModal.jsx';
import { Image } from '@fluentui/react/lib/Image';
import logo from './case_explorer.png';
import { CommandBar } from '@fluentui/react/lib/CommandBar';
import { FaGithub } from 'react-icons/fa';
import { registerIcons } from '@fluentui/react/lib/Styling';

registerIcons({
  icons: {
    Github: <FaGithub />
  }
});

const Header = props => {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  return (
    <div className="headerWrapper">
      <AboutModal open={modalOpen} onToggle={toggleModal} />
      <div className="header">
        <a href="https://mdcaseexplorer.com">
          <Image className="logo header-item" src={logo} />
        </a>
        <h3 className="title">{props.title}</h3>
        <CommandBar
          className="main-menu header-item"
          items={[
            {
              key: 'about',
              text: 'About',
              ariaLabel: 'Info',
              iconProps: { iconName: 'Info' },
              onClick: toggleModal
            },
            {
              key: 'exports',
              text: 'Exports',
              ariaLabel: 'CloudDownload',
              iconProps: { iconName: 'CloudDownload' },
              onClick: () =>
                window.open('https://mdcaseexplorer.com/exports', '_blank')
            },
            {
              key: 'donate',
              text: 'Donate',
              ariaLabel: 'Donate',
              iconProps: { iconName: 'Money' },
              onClick: () =>
                window.open(
                  'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=K2NTTKHJ58FRA',
                  '_blank'
                )
            },
            {
              key: 'code',
              text: 'Code',
              ariaLabel: 'Code',
              iconProps: { iconName: 'Github' },
              onClick: () =>
                window.open(
                  'https://github.com/dismantl/CaseExplorer',
                  '_blank'
                )
            }
          ]}
        />
        <span className="version">v{props.version}</span>
      </div>
    </div>
  );
};
export default Header;
