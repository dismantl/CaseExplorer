import React, { Component, useState } from 'react';
import AboutModal from './AboutModal.jsx';
import { Image } from '@fluentui/react/lib/Image';
import logo from './case_x_final.png';
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
        <div className="header-right">
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
        </div>
      </div>
    </div>
  );
};
export default Header;
