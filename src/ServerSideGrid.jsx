import React, { Component } from 'react';
import { API } from 'aws-amplify';
import environment from './config';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';
import { checkStatus, toTitleCase } from './utils';
import ExportToolPanel from './ExportToolPanel.jsx';

const sideBarConfig = {
  toolPanels: [
    {
      id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
      toolPanelParams: {
        suppressRowGroups: true,
        suppressValues: true,
        suppressPivots: true,
        suppressPivotMode: true
      }
    },
    {
      id: 'filters',
      labelDefault: 'Filters',
      labelKey: 'filters',
      iconKey: 'filter',
      toolPanel: 'agFiltersToolPanel'
    },
    {
      id: 'export',
      labelDefault: 'Export',
      labelKey: 'export',
      iconKey: 'save',
      toolPanel: 'exportToolPanel'
    }
  ],
  position: 'right'
};

export default class ServerSideGrid extends Component {
  onGridReady = params => {
    this.api = params.api;
    this.columnApi = params.columnApi;

    this.api.setServerSideDatasource({ getRows: this.getRows });
  };

  getRows = params => {
    var promise;
    if (environment === 'development') {
      promise = fetch(this.state.path, {
        method: 'post',
        body: JSON.stringify(params.request),
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })
        .then(checkStatus)
        .then(httpResponse => httpResponse.json());
    } else {
      promise = API.post(this.apiName, this.state.path, {
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
    this.apiName = props.apiName;
    this.state = {
      table: props.table,
      path: '/api/' + props.table,
      metadata: props.metadata
    };
  }

  render() {
    if (this.state.metadata !== null) {
      let sortedColumns = [];
      const table_metadata = this.state.metadata[this.state.table];
      for (const [column, column_metadata] of Object.entries(table_metadata)) {
        if (sortedColumns.length === 0)
          sortedColumns.push({ name: column, metadata: column_metadata });
        else {
          let inserted = false;
          for (let i = 0; i < sortedColumns.length; i++) {
            if (column_metadata.order < sortedColumns[i].metadata.order) {
              sortedColumns.splice(i, 0, {
                name: column,
                metadata: column_metadata
              });
              inserted = true;
              break;
            }
          }
          if (inserted === false)
            sortedColumns.push({ name: column, metadata: column_metadata });
        }
      }

      let gridColumns = [];
      for (const column of sortedColumns) {
        const metadata = column.metadata;
        let gridColumn;
        if (column.name.endsWith('_str') || column.name === 'id') continue;
        let columnLabel;
        if (metadata.label === '') columnLabel = toTitleCase(column.name);
        else columnLabel = metadata.label;
        if (
          metadata.allowed_values !== null &&
          metadata.allowed_values.length < 200
        ) {
          gridColumn = (
            <AgGridColumn
              field={column.name}
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
              key={this.state.table + '.' + column.name}
            />
          );
        } else if (column.name.search('date') > 0) {
          gridColumn = (
            <AgGridColumn
              field={column.name}
              headerName={columnLabel}
              width={
                metadata.width_pixels === null ? 200 : metadata.width_pixels
              }
              filter="agDateColumnFilter"
              filterParams={{
                debounceMs: 1000
              }}
              key={this.state.table + '.' + column.name}
            />
          );
        } else {
          gridColumn = (
            <AgGridColumn
              field={column.name}
              headerName={columnLabel}
              width={
                metadata.width_pixels === null ? 200 : metadata.width_pixels
              }
              key={this.state.table + '.' + column.name}
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
              suppressPivotMode
              rowModelType="serverSide"
              animateRows
              sideBar={sideBarConfig}
              frameworkComponents={{
                exportToolPanel: props => (
                  <ExportToolPanel
                    callback={() => {
                      this.api.exportDataAsCsv();
                    }}
                  />
                )
              }}
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
        <div className="ag-theme-balham" style={{ height: '100%' }}>
          <div className="ag-stub-cell">
            <span className="ag-loading-icon" ref="eLoadingIcon">
              <span
                className="ag-icon ag-icon-loading"
                unselectable="on"
              ></span>
            </span>
            <span className="ag-loading-text" ref="eLoadingText">
              Loading...
            </span>
          </div>
        </div>
      );
    }
  }
}
