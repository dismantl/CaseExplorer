import React from 'react';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import ServerSideGrid from './ServerSideGrid.jsx';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import "ag-grid-enterprise";


export default class Cases extends ServerSideGrid {
  constructor(props) {
    super(props);
    this.state = {path: "/cases"};
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
              width={175}
            />
            <AgGridColumn
              field="court"
              width={300}
            />
            <AgGridColumn
              field="case_type"
              headerName="Case Type"
              width={200}
            />
            <AgGridColumn
              field="status"
              width={200}
            />
            <AgGridColumn
              field="filing_date_original"
              headerName="Filing Date"
              width={150}
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
