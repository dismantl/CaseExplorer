import React from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import ServerSideGrid from './ServerSideGrid.jsx';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';

export default class Odycrim extends ServerSideGrid {
  constructor(props) {
    super(props);
    this.state = { path: '/api/odycrim' };
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
                  'Violation of Probation',
                  'Reopened',
                  'Appealed',
                  'Inactive / Incompetency',
                  'Open',
                  'Closed / Active',
                  'Reopened / Inactive',
                  'Completed',
                  'Closed',
                  'Citation Voided',
                  'Active',
                  'Open / Inactive',
                  'Open / Active',
                  'Closed / Inactive',
                  'Sub-Curia'
                ],
                suppressMiniFilter: false,
                newRowsAction: 'keep'
              }}
            />
            <AgGridColumn
              field="case_title"
              headerName="Case Title"
              width={250}
            />
            <AgGridColumn
              field="case_type"
              headerName="Case Type"
              width={210}
              filter="agSetColumnFilter"
              filterParams={{
                values: [
                  'Citation - Municipal Infraction',
                  'Fugitive',
                  'Criminal - Appeal - Motor Vehicle',
                  'Criminal - SOC - On View Arrest',
                  'Indictment',
                  'Post Conviction',
                  'Criminal - Appeal',
                  'Criminal - SOC - Application',
                  'Criminal - Information',
                  'Criminal',
                  'Citation - DNR',
                  'Criminal - JTP',
                  'Criminal - JTP - Motor Vehicle',
                  'Criminal Non-Support',
                  'Criminal - VOP Appeal',
                  'Adult Contributing to a Minor',
                  'Citation - Mass Transit',
                  'Citation - Civil',
                  'Criminal - VOP Appeal - Motor Vehicle',
                  'Criminal Indictment',
                  'Citation - Criminal'
                ],
                suppressMiniFilter: false,
                newRowsAction: 'keep'
              }}
            />
            <AgGridColumn
              field="tracking_numbers"
              headerName="Tracking Numbers"
              width={200}
            />
            <AgGridColumn field="location" width={200} />
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
