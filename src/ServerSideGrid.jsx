import React, { useRef, useMemo } from 'react';
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
import {
  Coachmark,
  DirectionalHint,
  TeachingBubbleContent
} from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';

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
  const [loadedData, { setTrue: setLoadedData }] = useBoolean(false);

  let coachmarkDefault = false;
  if (!localStorage['caseExplorerVisited']) {
    localStorage['caseExplorerVisited'] = true;
    coachmarkDefault = true;
  }
  const [isCoachmarkVisible, { toggle: toggleCoachmark }] = useBoolean(
    coachmarkDefault
  );
  const coachmarkTarget = useRef(null);

  const showMeButtonProps = useMemo(
    () => ({
      children: 'Show me',
      onClick: event => {
        toggleCoachmark();
        let row = api.getDisplayedRowAtIndex(api.getFirstDisplayedRow());
        row.setExpanded(true);
      }
    }),
    [api, toggleCoachmark]
  );

  const gotItButtonProps = useMemo(
    () => ({
      children: 'Got it',
      onClick: toggleCoachmark
    }),
    [toggleCoachmark]
  );

  if (byCop) path = `/api/v1/bpd/seq/${seq}`;
  else path = `/api/v1/${table}`;

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
        setLoadedData(true);
        if (!initialized) {
          initialized = true;
          params.columnApi.autoSizeAllColumns();
        } else {
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
    if (byCop) {
      const columnState = {
        state: [
          {
            colId: 'filing_date',
            sort: 'desc'
          }
        ]
      };
      params.columnApi.applyColumnState(columnState);
    }
  };

  if (metadata) {
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
            width={200}
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
            width={200}
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
            width={200}
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
      <>
        <div style={{ height: '100vh' }} className="ag-theme-balham">
          <div className="coachmark-target" ref={coachmarkTarget}></div>
          {isCoachmarkVisible && loadedData && (
            <Coachmark
              target={coachmarkTarget.current}
              positioningContainerProps={{
                directionalHint: DirectionalHint.leftTopEdge,
                doNotLayer: false
              }}
              ariaAlertText="New feature"
              ariaDescribedBy="coachmark-desc1"
              ariaLabelledBy="coachmark-label1"
              ariaDescribedByText="Press enter or alt + C to open the coachmark notification"
              ariaLabelledByText="Coachmark notification"
            >
              <TeachingBubbleContent
                headline="See full case details"
                hasCloseButton
                closeButtonAriaLabel="Close"
                primaryButtonProps={showMeButtonProps}
                secondaryButtonProps={gotItButtonProps}
                onDismiss={toggleCoachmark}
                ariaDescribedBy="example-description1"
                ariaLabelledBy="example-label1"
              >
                Want to see all of a case's information in one place? Now you
                can expand rows by clicking on the arrow to the left of each
                case number, showing all of the case details.
              </TeachingBubbleContent>
            </Coachmark>
          )}
          <AgGridReact
            onGridReady={onGridReady}
            suppressColumnVirtualisation
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
                  statusPanelParams: {
                    table: table,
                    byCop: byCop,
                    seq: seq
                  }
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
export default ServerSideGrid;
