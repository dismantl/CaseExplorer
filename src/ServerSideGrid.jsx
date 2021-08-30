import React from 'react';
import { API } from 'aws-amplify';
import environment from './config';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';
import { checkStatus, toTitleCase, genSortedColumns } from './utils';
import ExportToolPanel from './ExportToolPanel';
import { useParams } from 'react-router-dom';
import CustomStatusBar from './StatusBar';
import apiName from './ApiName';
import DetailCellRenderer from './DetailCaseRenderer';

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
    initialized = false;
  const { table, metadata, byCop } = props;
  if (byCop) path = `/api/bpd/seq/${seq}`;
  else path = `/api/${table}`;

  const getRows = params => {
    let promise;
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
        else {
          const statusBarComponent = api.getStatusPanel('customStatusBarKey');
          let componentInstance = statusBarComponent;
          if (statusBarComponent)
            componentInstance = statusBarComponent.getFrameworkComponentInstance();
          componentInstance.updateTotal(params);
        }
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
    const sortedColumns = genSortedColumns(metadata.columns, table);
    let gridColumns = [];
    for (const column of sortedColumns) {
      const colMetadata = column.metadata;
      let gridColumn;
      if (column.name.endsWith('_str') || column.name === 'id') continue;
      let columnLabel;
      if (colMetadata.label === '') columnLabel = toTitleCase(column.name);
      else columnLabel = colMetadata.label;
      const tooltipText = colMetadata.description;
      if (
        colMetadata.allowed_values !== null &&
        colMetadata.allowed_values.length < 200
      ) {
        gridColumn = (
          <AgGridColumn
            field={column.name}
            headerName={columnLabel}
            headerTooltip={tooltipText}
            width={
              colMetadata.width_pixels === null ? 200 : colMetadata.width_pixels
            }
            filter="agSetColumnFilter"
            filterParams={{
              values: colMetadata.allowed_values,
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
            width={
              colMetadata.width_pixels === null ? 200 : colMetadata.width_pixels
            }
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
            width={
              colMetadata.width_pixels === null ? 200 : colMetadata.width_pixels
            }
            key={table + '.' + column.name}
            cellRenderer={
              column.name === 'case_number' ? 'agGroupCellRenderer' : ''
            }
          />
        );
      }
      gridColumns.push(gridColumn);
    }

    return (
      <div>
        <div style={{ height: '100vh' }} className="ag-theme-balham">
          <AgGridReact
            onGridReady={onGridReady}
            masterDetail
            // embedFullWidthRows  // causes detail cell renderer to render 3x (bug AG-4156)
            detailRowAutoHeight
            detailCellRenderer="detailCellRenderer"
            detailCellRendererParams={{
              metadata: metadata,
              table: table
            }}
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
              customStatusBar: CustomStatusBar,
              detailCellRenderer: DetailCellRenderer
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
