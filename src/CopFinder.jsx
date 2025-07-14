import React, { useState } from 'react';
import { checkStatus } from './utils';
import { TextField } from '@fluentui/react/lib/TextField';
import { IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import environment from './config';
import { API } from 'aws-amplify';
import { getURLLastPart } from './utils';

const CopFinder = props => {
  let value;
  if (window.location.pathname.startsWith('/bpd')) {
    value = getURLLastPart();
  } else {
    value = '';
  }
  const [copVal, setCopVal] = useState(value);

  const handleSubmit = event => {
    event.preventDefault();
    let promise, path;
    if (copVal.includes('bpdwatch.com')) {
      const id = copVal.substring(copVal.lastIndexOf('/') + 1);
      path = `/api/v1/bpd/id/${id}`;
      if (environment === 'amplify') {
        promise = API.get(props.apiName, path);
      } else {
        promise = fetch(path)
          .then(checkStatus)
          .then(httpResponse => httpResponse.json());
      }
      promise
        .then(response => {
          window.location.href = `/bpd/${response}`;
        })
        .catch(error => {
          console.error(error);
          return;
          // TODO report error to user
        });
    } else {
      window.location.href = `/bpd/${copVal}`;
    }
  };

  return (
    <form id="copFinder" onSubmit={handleSubmit}>
      <Stack horizontal>
        <Stack.Item grow={1}>
          <TextField
            ariaLabel="Search By BPD Officer"
            onChange={(event, val) => {
              setCopVal(val);
            }}
            onRenderDescription={props => {
              return (
                <span
                  className="ms-TextField-description"
                  style={{
                    whiteSpace: 'nowrap',
                    color: '#605e5c',
                    fontSize: '10px'
                  }}
                >
                  Enter sequence number or{' '}
                  <a href="https://bpdwatch.com">BPD Watch</a> profile URL
                </span>
              );
            }}
            defaultValue={value}
          />
        </Stack.Item>
        <IconButton
          iconProps={{ iconName: 'search' }}
          title="Search"
          ariaLabel="Search"
          onClick={handleSubmit}
        />
      </Stack>
    </form>
  );
};
export default CopFinder;
