import React, { useState } from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { getURLLastPart } from './utils';

const CaseFinder: React.FunctionComponent = props => {
  let value;
  if (window.location.pathname.startsWith('/case')) {
    value = getURLLastPart();
  } else {
    value = '';
  }
  const [caseVal, setCaseVal] = useState(value);

  const handleSubmit = event => {
    event.preventDefault();
    window.location.href = `/case/${caseVal}`;
  };

  return (
    <form id="caseFinder" onSubmit={handleSubmit}>
      <Stack horizontal>
        <Stack.Item grow={1}>
          <TextField
            ariaLabel="Search By Case Number"
            onChange={(event, val) => {
              setCaseVal(val);
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
export default CaseFinder;
