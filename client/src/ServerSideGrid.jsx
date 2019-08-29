import React, {Component} from 'react';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error); // eslint-disable-line no-console
  throw error;
}

export default class ServerSideGrid extends Component {
  onGridReady = (params) => {
    this.api = params.api;
    this.columnApi = params.columnApi;

    this.api.setServerSideDatasource({getRows: this.getRows});
  };

  getRows = (params) => {
    console.log(JSON.stringify(params.request, null, 1));

    fetch(this.state.path, {
      method: 'post',
      body: JSON.stringify(params.request),
      headers: {"Content-Type": "application/json; charset=utf-8"},
    })
      .then(checkStatus)
      .then((httpResponse) => httpResponse.json())
      .then((response) => {
        params.successCallback(response.rows, response.lastRow);
      })
      .catch((error) => {
        console.error(error);
        params.failCallback();
      });
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        {this.props.render(this.state)}
      </div>
    );
  }
}
