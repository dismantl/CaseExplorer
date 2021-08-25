import React, { useState, useEffect } from 'react';
import environment from './config';
import { checkStatus } from './utils';
import { API } from 'aws-amplify';
import apiName from './ApiName';
import { numberWithCommas } from './utils';

export default props => {
  const [count, setCount] = useState(0);

  const fetchTotal = () => {
    var promise;
    if (environment === 'development') {
      promise = fetch(`/api/${props.table}/total`)
        .then(checkStatus)
        .then(httpResponse => httpResponse.json());
    } else {
      promise = API.get(apiName, `/api/${props.table}/total`);
    }
    promise
      .then(response => {
        setCount(numberWithCommas(response));
      })
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(fetchTotal);

  return (
    <div className="ag-status-bar-center">
      <div className="ag-status-name-value ag-status-panel ag-status-panel-total-row-count">
        <span className="label">Approximate Total Rows</span>:&nbsp;
        <span id="total-row-count" className="ag-status-name-value-value">
          {count}
        </span>
      </div>
    </div>
  );
};
