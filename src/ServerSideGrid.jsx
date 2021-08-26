import React, { useState } from 'react';
import { API } from 'aws-amplify';
import environment from './config';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';
import { checkStatus, toTitleCase } from './utils';
import ExportToolPanel from './ExportToolPanel';
import { useParams } from 'react-router-dom';
import CustomStatusBar from './StatusBar';
import apiName from './ApiName';
import { numberWithCommas } from './utils';

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

const ServerSideGrid = props => {
  let { seq } = useParams();
  let api,
    path,
    countPromise = null,
    initialized = false;
  const { table, metadata, byCop } = props;
  if (byCop) path = `/api/bpd/seq/${seq}`;
  else path = `/api/${table}`;

  let controller = new AbortController();
  const getCount = params => {
    if (countPromise !== null) controller.abort();
    controller = new AbortController();
    const statusBarComponent = api.getStatusPanel('customStatusBarKey');
    let componentInstance = statusBarComponent;
    componentInstance.reactElement.props.reactContainer.children[0].children[0].children[0].innerText =
      'Total Rows';
    componentInstance.reactElement.props.reactContainer.children[0].children[0].children[1].innerHTML =
      '<span class="ag-loading-icon" ref="eLoadingIcon"><span class="ag-icon ag-icon-loading" unselectable="on" role="presentation"></span></span>';
    const path = `/api/${table}/filtered/total`;
    if (environment === 'development') {
      countPromise = fetch(path, {
        method: 'post',
        body: JSON.stringify(params.request),
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        signal: controller.signal
      }).then(checkStatus);
    } else {
      countPromise = API.post(apiName, path, {
        body: params.request,
        signal: controller.signal
      });
    }
    countPromise
      .then(response => {
        if (typeof response.json === 'function') return response.json();
        else return response;
      })
      .then(response => {
        componentInstance.reactElement.props.reactContainer.children[0].children[0].children[1].innerText = numberWithCommas(
          response
        );
      })
      .catch(error => {
        console.error(error);
        // params.fail();
      });
  };

  const getRows = params => {
    var promise;
    if (environment === 'development') {
      promise = fetch(path, {
        method: 'post',
        body: JSON.stringify(params.request),
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })
        .then(checkStatus)
        .then(httpResponse => httpResponse.json());
    } else {
      promise = API.post(apiName, path, {
        body: JSON.stringify(params.request)
      });
    }
    promise
      .then(response => {
        params.success({ rowData: response.rows, rowCount: response.lastRow });
        if (!initialized) initialized = true;
        else getCount(params);
      })
      .catch(error => {
        console.error(error);
        params.fail();
      });
  };

  const onGridReady = params => {
    api = params.api;
    params.api.setServerSideDatasource({ getRows: getRows });
  };

  if (metadata !== null) {
    let sortedColumns = [];
    const table_metadata = metadata[table];
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
      const tooltipText = metadata.description;
      if (
        metadata.allowed_values !== null &&
        metadata.allowed_values.length < 200
      ) {
        gridColumn = (
          <AgGridColumn
            field={column.name}
            headerName={columnLabel}
            headerTooltip={tooltipText}
            width={metadata.width_pixels === null ? 200 : metadata.width_pixels}
            filter="agSetColumnFilter"
            filterParams={{
              values: metadata.allowed_values,
              suppressMiniFilter: true,
              newRowsAction: 'keep'
            }}
            key={table + '.' + column.name}
          />
        );
      } else if (column.name.search('date') > 0) {
        gridColumn = (
          <AgGridColumn
            field={column.name}
            headerName={columnLabel}
            headerTooltip={tooltipText}
            width={metadata.width_pixels === null ? 200 : metadata.width_pixels}
            filter="agDateColumnFilter"
            filterParams={{
              debounceMs: 1000
            }}
            key={table + '.' + column.name}
          />
        );
      } else {
        gridColumn = (
          <AgGridColumn
            field={column.name}
            headerName={columnLabel}
            headerTooltip={tooltipText}
            width={metadata.width_pixels === null ? 200 : metadata.width_pixels}
            key={table + '.' + column.name}
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
            onGridReady={onGridReady}
            // no binding, just providing hard coded strings for the properties
            // boolean properties will default to true if provided (ie suppressRowClickSelection => suppressRowClickSelection="true")
            // suppressRowClickSelection
            rowSelection="multiple"
            enableRangeSelection
            suppressPivotMode
            rowModelType="serverSide"
            animateRows
            sideBar={sideBarConfig}
            statusBar={{
              statusPanels: [
                {
                  statusPanel: 'customStatusBar',
                  key: 'customStatusBarKey',
                  align: 'center',
                  statusPanelParams: { table: table }
                }
              ]
            }}
            serverSideStoreType="partial"
            frameworkComponents={{
              exportToolPanel: props => (
                <ExportToolPanel
                  csvCallback={() => {
                    api.exportDataAsCsv();
                  }}
                  excelCallback={() => {
                    api.exportDataAsExcel();
                  }}
                />
              ),
              customStatusBar: CustomStatusBar
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
            <span className="ag-icon ag-icon-loading" unselectable="on"></span>
          </span>
          <span className="ag-loading-text" ref="eLoadingText">
            Loading...
          </span>
        </div>
      </div>
    );
  }
};
export default ServerSideGrid;
