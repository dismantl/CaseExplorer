import React, { Component } from 'react';
import { API } from 'aws-amplify';
import environment from './config';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';

const apiName = 'caseexplorerapi';

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

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
  onGridReady = params => {
    this.api = params.api;
    this.columnApi = params.columnApi;

    this.api.setServerSideDatasource({ getRows: this.getRows });
  };

  getRows = params => {
    var promise;
    console.log(JSON.stringify(params.request, null, 1));

    if (environment === 'development') {
      promise = fetch(this.state.path, {
        method: 'post',
        body: JSON.stringify(params.request),
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })
        .then(checkStatus)
        .then(httpResponse => httpResponse.json());
    } else {
      promise = API.post(apiName, this.state.path, {
        body: JSON.stringify(params.request)
      });
    }
    promise
      .then(response => {
        params.successCallback(response.rows, response.lastRow);
      })
      .catch(error => {
        console.error(error);
        params.failCallback();
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      table: props.table,
      path: '/api/' + props.table,
      metadata: null
    };
    this.fetchColumnMetadata();
  }

  fetchColumnMetadata = () => {
    var promise;
    if (environment === 'development') {
      promise = fetch('/api/metadata')
        .then(checkStatus)
        .then(httpResponse => httpResponse.json());
    } else {
      promise = API.get(apiName, '/api/metadata');
    }
    promise.then(response => {
      this.setState({ metadata: response });
    });
  };

  render() {
    if (this.state.metadata !== null) {
      let gridColumns = [];
      for (const column in this.state.metadata[this.state.table]) {
        const metadata = this.state.metadata[this.state.table][column];
        let gridColumn;
        if (column.endsWith('_str') || column === 'id') continue;
        let columnLabel = toTitleCase(column.replace('_', ' '));
        if (
          metadata.allowed_values !== null &&
          metadata.allowed_values.length < 200
        ) {
          gridColumn = (
            <AgGridColumn
              field={column}
              headerName={columnLabel}
              width={
                metadata.width_pixels === null ? 200 : metadata.width_pixels
              }
              filter="agSetColumnFilter"
              filterParams={{
                values: metadata.allowed_values,
                suppressMiniFilter: true,
                newRowsAction: 'keep'
              }}
              key={this.state.table + '.' + column}
            />
          );
        } else if (column.search('date') > 0) {
          gridColumn = (
            <AgGridColumn
              field={column}
              headerName={columnLabel}
              width={
                metadata.width_pixels === null ? 200 : metadata.width_pixels
              }
              filter="agDateColumnFilter"
              filterParams={{
                debounceMs: 1000
              }}
              key={this.state.table + '.' + column}
            />
          );
        } else {
          gridColumn = (
            <AgGridColumn
              field={column}
              headerName={columnLabel}
              width={
                metadata.width_pixels === null ? 200 : metadata.width_pixels
              }
              key={this.state.table + '.' + column}
            />
          );
        }
        gridColumns.push(gridColumn);
      }

      return (
        <div>
          <div style={{ height: '100vh' }} className="ag-theme-balham">
            <AgGridReact
              // listening for events
              onGridReady={this.onGridReady}
              // no binding, just providing hard coded strings for the properties
              // boolean properties will default to true if provided (ie suppressRowClickSelection => suppressRowClickSelection="true")
              suppressRowClickSelection
              rowModelType="serverSide"
              animateRows
              // setting default column properties
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: 'agTextColumnFilter',
                headerComponentFramework: SortableHeaderComponent,
                headerComponentParams: {
                  menuIcon: 'fa-bars'
                }
              }}
            >
              {gridColumns}
            </AgGridReact>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ height: '100%' }}>
          <h6>Loading...</h6>
        </div>
      );
    }
  }
}
