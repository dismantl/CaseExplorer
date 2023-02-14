import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { useBoolean } from '@fluentui/react-hooks';
import { useCookies } from 'react-cookie';
import './AnnouncementModal.css';

const modelProps = {
  className: 'announcement-modal',
  isBlocking: false,
  styles: { main: { maxWidth: 800 } }
};
const dialogContentProps = {
  type: DialogType.largeHeader,
  title: 'Updates coming soon to Case Explorer',
  styles: {
    content: {
      p: { margin: '0px 0px 24px', lineHeight: '1.5em' },
      a: { outline: 'none' }
    }
  }
};

export function Announcement() {
  return (
    <>
      <p>
        Open Justice Baltimore recently secured funding to cover our database
        hosting costs for the coming year thanks to the{' '}
        <a target="_blank" href="https://abell.org/">
          Abell Foundation
        </a>
        . This funding will also allow us to research and implement methods for
        bypassing the anti-scraping protections on the Maryland Judiciary Case
        Search, with the aim to begin collecting case data again this Spring.
        For now, Case Explorer contains case data as new as May 2022.
      </p>
    </>
  );
}

export default function AnnouncementModal() {
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
  const [cookies, setCookie] = useCookies(['announcement']);

  const closeDialog = () => {
    setCookie('announcement', 'true', {
      expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
    });
    toggleHideDialog();
  };

  return (
    <>
      {cookies.announcement === undefined && (
        <Dialog
          hidden={hideDialog}
          dialogContentProps={dialogContentProps}
          modalProps={modelProps}
          onDismiss={closeDialog}
        >
          <Announcement />
          <DialogFooter>
            <PrimaryButton onClick={closeDialog} text="OK" />
          </DialogFooter>
        </Dialog>
      )}
    </>
  );
}
