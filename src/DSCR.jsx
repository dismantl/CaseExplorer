import React from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import ServerSideGrid from './ServerSideGrid.jsx';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';

export default class Dscr extends ServerSideGrid {
  constructor(props) {
    super(props);
    this.state = { path: '/api/dscr' };
  }

  render() {
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
                  'DEFERRED PAYMENT',
                  'SUB-CURIA',
                  'CLOSED',
                  'ACTIVE',
                  'DELINQUENT',
                  'INACTIVE DUE TO INCOMPETENCY',
                  'APPEAL',
                  'PROBATION'
                ],
                suppressMiniFilter: true,
                newRowsAction: 'keep'
              }}
            />
            <AgGridColumn
              field="case_type"
              headerName="Case Type"
              width={150}
              filter="agSetColumnFilter"
              filterParams={{
                values: ['CRIMINAL', 'FUGITIVE WARRANT'],
                suppressMiniFilter: true,
                newRowsAction: 'keep'
              }}
            />
            <AgGridColumn
              field="tracking_number"
              headerName="Tracking Number"
              width={185}
            />
            <AgGridColumn
              field="case_disposition"
              headerName="Case Disposition"
              width={180}
              filter="agSetColumnFilter"
              filterParams={{
                values: [
                  'FAILED TO APPEAR',
                  'EXTRADITION',
                  'FORWARDED TO CIRCUIT COURT',
                  'PSI OR SUB-CURIA',
                  'TRIAL',
                  'JURY TRIAL PRAYED',
                  'FORWARDED TO JUVENILE AUTHORITIES'
                ],
                suppressMiniFilter: true,
                newRowsAction: 'keep'
              }}
            />
            <AgGridColumn
              field="document_type"
              headerName="Document Type"
              width={180}
              filter="agSetColumnFilter"
              filterParams={{
                values: [
                  'WARRANT',
                  'INFORMATION',
                  'STATEMENT OF CHARGES',
                  'CITATION',
                  'SUMMONS',
                  'APPLICATION FOR CHARGES'
                ],
                suppressMiniFilter: true,
                newRowsAction: 'keep'
              }}
            />
            <AgGridColumn
              field="issued_date_str"
              headerName="Issued Date"
              width={150}
              filter="agDateColumnFilter"
              filterParams={{
                debounceMs: 1000
              }}
            />
            <AgGridColumn
              field="district_code"
              headerName="District Code"
              width={160}
              filter="agSetColumnFilter"
              filterParams={{
                values: [1, 5, 6],
                suppressMiniFilter: true,
                newRowsAction: 'keep'
              }}
            />
            <AgGridColumn
              field="location_code"
              headerName="Location Code"
              width={165}
              filter="agSetColumnFilter"
              filterParams={{
                values: [1, 2, 3, 4, 5],
                suppressMiniFilter: true,
                newRowsAction: 'keep'
              }}
            />
          </AgGridReact>
        </div>
      </div>
    );
  }
}
