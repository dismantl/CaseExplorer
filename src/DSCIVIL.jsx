import React from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import ServerSideGrid from './ServerSideGrid.jsx';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';

export default class Dscivil extends ServerSideGrid {
  constructor(props) {
    super(props);
    this.state = { path: '/api/dscivil' };
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
                  'SUB-CURIA',
                  'CLOSED',
                  'APPEALED',
                  'ACTIVE',
                  'BANKRUPTCY'
                ],
                suppressMiniFilter: true,
                newRowsAction: 'keep'
              }}
            />
            <AgGridColumn
              field="claim_type"
              headerName="Claim Type"
              width={200}
              filter="agSetColumnFilter"
              filterParams={{
                values: [
                  'DISTRESS/DISTRAINT',
                  'PETITION FOR APPOINTMENT OF A RECEIVER',
                  'DETINUE',
                  'CONDEMNATION-IMMEDIATE POSSESSION AND TTITLE',
                  'RENT ESCROW',
                  'TORT',
                  'RESTITUTION',
                  'FORFEITURE OF BOND',
                  'TENANT HOLDING OVER',
                  'SPECIAL PROCEEDING PETITION',
                  'DOMESTIC VIOLENCE VULNARABLE ADULT',
                  'DOMESTIC VIOLENCE CHILD ABUSE',
                  'LANDLORD TENANT MONEY JUDGMENT',
                  'EMERGENCY EVALUATIONS',
                  'CONTRACT',
                  'INJUNCTION',
                  'CONTEMPT',
                  'DOMESTIC VIOLENCE',
                  'BREACH OF LEASE',
                  'FOREIGN',
                  'FORCIBLE ENTRY AND DETAINER',
                  'CONFESSED JUDGMENT',
                  'MUNICIPAL INFRACTION',
                  'FORFEITURE',
                  'CONVERTED FROM OLD SYSTEM',
                  'REPLEVIN',
                  'PEACE ORDER'
                ],
                suppressMiniFilter: false,
                newRowsAction: 'keep'
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
                values: [1, 2, 3],
                suppressMiniFilter: true,
                newRowsAction: 'keep'
              }}
            />
            <AgGridColumn
              field="filing_date_str"
              headerName="Filing Date"
              width={150}
              filter="agDateColumnFilter"
              filterParams={{
                debounceMs: 1000
              }}
            />
          </AgGridReact>
        </div>
      </div>
    );
  }
}
