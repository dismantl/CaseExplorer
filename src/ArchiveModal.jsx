import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { useBoolean } from '@fluentui/react-hooks';
import { useCookies } from 'react-cookie';
import './ArchiveModal.css';

const modelProps = {
  className: 'archive-modal',
  isBlocking: false,
  styles: { main: { maxWidth: 800 } }
};
const dialogContentProps = {
  type: DialogType.largeHeader,
  title: 'Case Explorer will be shutting down soon',
  styles: {
    content: {
      p: { margin: '0px 0px 24px', lineHeight: '1.5em' },
      a: { outline: 'none' }
    }
  }
};

export function ArchiveAnnouncement() {
  return (
    <>
      <p>
        At the end of February 2023, Case Explorer will be shutting down until
        we are able to secure funding for our ongoing database hosting costs.
        You will still be able to download{' '}
        <a target="_blank" href="https://exports.mdcaseexplorer.com/">
          exports of the database
        </a>
        .
      </p>
      <p>
        Please note that the database does not contain any cases newer than May
        2022 due to the MD Judiciary's implementation of anti-scraping
        technologies.
      </p>
    </>
  );
}

export default function ArchiveModal() {
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
  const [cookies, setCookie] = useCookies(['archive']);

  const closeDialog = () => {
    setCookie('archive', 'true', {
      expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    });
    toggleHideDialog();
  };

  return (
    <>
      {cookies.archive === undefined && (
        <Dialog
          hidden={hideDialog}
          dialogContentProps={dialogContentProps}
          modalProps={modelProps}
          onDismiss={closeDialog}
        >
          <ArchiveAnnouncement />
          <DialogFooter>
            <PrimaryButton onClick={closeDialog} text="OK" />
          </DialogFooter>
        </Dialog>
      )}
    </>
  );
}
