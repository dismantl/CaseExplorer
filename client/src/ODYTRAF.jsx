import React from 'react';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import ServerSideGrid from './ServerSideGrid.jsx';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import "ag-grid-enterprise";


export default class Odytraf extends ServerSideGrid {
  constructor(props) {
    super(props);
    this.state = {path: "/odytraf"};
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
              filterParams={{
                values: [
                  'Active',
                  'Open',
                  'Open / Inactive',
                  'Closed',
                ],
                suppressMiniFilter: true,
                newRowsAction: "keep",
              }}
            />
            <AgGridColumn
              field="case_title"
              headerName="Case Title"
              width={150}
            />
            <AgGridColumn
              field="case_type"
              headerName="Case Type"
              width={150}
            />
            <AgGridColumn
              field="location"
              width={150}
            />
            <AgGridColumn
              field="filing_date_str"
              headerName="Filing Date"
              width={150}
              filter="agDateColumnFilter"
              filterParams={{
                debounceMs: 1000,
              }}
            />
            <AgGridColumn
              field="violation_date_str"
              headerName="Violation Date"
              width={165}
              filter="agDateColumnFilter"
              filterParams={{
                debounceMs: 1000,
              }}
            />
            <AgGridColumn
              field="violation_time_str"
              headerName="Violation Time"
              width={165}
            />
            <AgGridColumn
              field="violation_county"
              headerName="Violation County"
              width={180}
            />
          </AgGridReact>
        </div>
      </div>
    );
  }
}
