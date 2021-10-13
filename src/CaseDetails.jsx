import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import environment from './config';
import { API } from 'aws-amplify';
import { checkStatus } from './utils';

const CaseRenderer = props => {
  let { case_number } = useParams();
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
    let promise,
      path = `/api/v1/html/${case_number}`;
    if (environment === 'development') {
      promise = fetch(path)
        .then(checkStatus)
        .then(httpResponse => httpResponse.json());
    } else {
      promise = API.get(props.apiName, path);
    }
    promise.then(data => {
      let el = document.createElement('html');
      el.innerHTML = data['html'];
      setCaseData({
        __html: el.getElementsByClassName('BodyWindow')[0].innerHTML
      });
    });
  }, []);

  return (
    <div id="case-details">
      <div
        className="BodyWindow"
        style={{ display: 'table-caption' }}
        dangerouslySetInnerHTML={caseData}
      />
    </div>
  );
};
export default CaseRenderer;
