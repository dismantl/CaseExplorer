import React from 'react';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import ServerSideGrid from './ServerSideGrid.jsx';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import "ag-grid-enterprise";


export default class Dsk8 extends ServerSideGrid {
  constructor(props) {
    super(props);
    this.state = {path: "/dsk8"};
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
                  'WARRANT',
                  'INACTIVE',
                  'SUB-CURIA',
                  'CLOSED',
                  'ACTIVE',
                  'NOT COMPETENT TO STAND TRIAL',
                  'VIOLATION OF PROBATION',
                  'APPEAL',
                  'POST-CONVICTION',
                ],
                suppressMiniFilter: true,
                newRowsAction: "keep",
              }}
            />
            <AgGridColumn
              field="district_case_number"
              headerName="District Case Number"
              width={210}
            />
            <AgGridColumn
              field="tracking_number"
              headerName="Tracking Number"
              width={185}
            />
            <AgGridColumn
              field="complaint_number"
              headerName="Complaint Number"
              width={190}
            />
            <AgGridColumn
              field="status_date_str"
              headerName="Status Date"
              width={150}
              filter="agDateColumnFilter"
              filterParams={{
                debounceMs: 1000,
              }}
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
              field="incident_date_str"
              headerName="Incident Date"
              width={160}
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
