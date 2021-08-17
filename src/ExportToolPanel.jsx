import React from 'react';

export default props => {
  return (
    <div style={{ textAlign: 'center' }}>
      <span>
        <h2>
          <i className="fa fa-download"></i> Export Data
        </h2>
        <p>Click here to export the currently visible data to a CSV file.</p>
        <p>
          <button onClick={props.callback}>Export to CSV</button>
        </p>
      </span>
    </div>
  );
};
