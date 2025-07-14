import React from 'react';
import { API } from 'aws-amplify';
import environment from './config';
import { AgGridReact } from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';
import { checkStatus } from './utils';
import ExportToolPanel from './ExportToolPanel';
import apiName from './ApiName';

const sideBarConfig = {
  toolPanels: [
    {
      id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
      toolPanelParams: {
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

const BailExplorer = props => {
  let api;
  const { metadata } = props;
  const path = `/api/v1/bail_stats`;

  const getRows = params => {
    let promise;
    if (environment === 'amplify') {
      promise = API.post(apiName, path, {
        body: params.request
      });
    } else {
      promise = fetch(path, {
        method: 'post',
        body: JSON.stringify(params.request),
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })
        .then(checkStatus)
        .then(httpResponse => httpResponse.json());
    }
    promise
      .then(response => {
        params.success({ rowData: response.rows, rowCount: response.lastRow });
        params.columnApi.autoSizeAllColumns();
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

  if (metadata) {
    return (
      <>
        <div style={{ height: '100vh' }} className="ag-theme-balham">
          <AgGridReact
            onGridReady={onGridReady}
            suppressColumnVirtualisation
            rowSelection="multiple"
            enableRangeSelection
            suppressPivotMode
            rowModelType="serverSide"
            animateRows
            sideBar={sideBarConfig}
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
              )
            }}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: 'agTextColumnFilter',
              headerComponentFramework: SortableHeaderComponent,
              headerComponentParams: {
                menuIcon: 'fa-bars'
              },
              width: '250px'
            }}
            groupDisplayType="singleColumn"
            rowGroupPanelShow="always"
            columnDefs={[
              {
                field: 'court_system',
                headerName: 'Court System',
                enableRowGroup: true,
                rowGroup: true,
                hide: true
              },
              {
                field: 'event_name',
                headerName: 'Event Name',
                enableRowGroup: true,
                rowGroup: true,
                hide: true
              },
              {
                field: 'race',
                headerName: 'Defendant Race',
                enableRowGroup: true,
                rowGroup: true,
                hide: true
              },
              {
                field: 'sex',
                headerName: 'Defendant Sex',
                enableRowGroup: true,
                rowGroup: true,
                hide: true
              },
              {
                field: 'code',
                headerName: 'Code',
                enableRowGroup: true,
                rowGroup: true,
                hide: true
              },
              {
                field: 'type_of_bond',
                headerName: 'Type of Bond',
                enableRowGroup: true,
                rowGroup: true,
                hide: true
              },
              {
                field: 'bail_amount',
                headerName: 'Bail Amount',
                allowedAggFuncs: ['avg', 'min', 'max'],
                aggFunc: 'avg',
                enableValue: true
              },
              {
                field: 'percentage_required',
                headerName: 'Percentage Required',
                allowedAggFuncs: ['avg'],
                aggFunc: 'avg',
                enableValue: true
              }
            ]}
          />
        </div>
      </>
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
export default BailExplorer;
