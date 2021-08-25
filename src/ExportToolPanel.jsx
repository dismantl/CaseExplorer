import React from 'react';

export default props => {
  return (
    <div style={{ textAlign: 'center' }}>
      <span>
        <h2>
          <i className="fa fa-download"></i> Export Data
        </h2>
        <p>
          Click here to export the <strong>currently visible data</strong> to a
          CSV or Excel file.
        </p>
        <p>
          <button onClick={props.csvCallback}>Export to CSV</button>
        </p>
        <p>
          <button onClick={props.excelCallback}>Export to Excel</button>
        </p>
      </span>
    </div>
  );
};
