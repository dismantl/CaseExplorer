import React from 'react';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import ServerSideGrid from './ServerSideGrid.jsx';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import "ag-grid-enterprise";


export default class Cc extends ServerSideGrid {
  constructor(props) {
    super(props);
    this.state = {path: "/cc"};
  }

  render() {
    return (
      <div>
        <div style={{height: "100vh"}} className="ag-theme-balham">
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
                menuIcon: 'fa-bars',
              },
            }}
          >
            <AgGridColumn
              field="case_number"
              headerName="Case Number"
              width={160}
            />
            <AgGridColumn
              field="court_system"
              headerName="Court System"
              width={200}
            />
            <AgGridColumn
              field="case_status"
              headerName="Case Status"
              width={150}
              filter="agSetColumnFilter"
              filterParams={{
                values: [
                  'Open/Active',
                  'Open/Inactive',
                  'Closed/Inactive',
                  'Reopened/Inactive',
                  'Closed/Active',
                  'Reopened/Active',
                ],
                suppressMiniFilter: true,
                newRowsAction: "keep",
              }}
            />
            <AgGridColumn
              field="title"
              width={250}
            />
            <AgGridColumn
              field="case_type"
              headerName="Case Type"
              width={200}
            />
            <AgGridColumn
              field="filing_date_str"
              headerName="Filing Date"
              width={145}
              filter="agDateColumnFilter"
              filterParams={{
                debounceMs: 1000,
              }}
            />
            <AgGridColumn
              field="case_disposition"
              headerName="Case Disposition"
              width={185}
            />
            <AgGridColumn
              field="disposition_date_str"
              headerName="Disposition Date"
              width={180}
              filter="agDateColumnFilter"
              filterParams={{
                debounceMs: 1000,
              }}
            />
          </AgGridReact>
        </div>
      </div>
    );
  }
}
