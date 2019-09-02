import React, { Component } from 'react';
import { API } from 'aws-amplify';

const apiName = 'apicf08954a';

export default class ServerSideGrid extends Component {
  onGridReady = params => {
    this.api = params.api;
    this.columnApi = params.columnApi;

    this.api.setServerSideDatasource({ getRows: this.getRows });
  };

  getRows = params => {
    console.log(JSON.stringify(params.request, null, 1));

    API.post(apiName, this.state.path, { body: JSON.stringify(params.request) })
      .then(response => {
        params.successCallback(response.rows, response.lastRow);
      })
      .catch(error => {
        console.error(error);
        params.failCallback();
      });
  };

  render() {
    return (
      <div style={{ height: '100%' }}>{this.props.render(this.state)}</div>
    );
  }
}
