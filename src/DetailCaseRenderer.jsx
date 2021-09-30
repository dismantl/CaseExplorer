import React, { Component } from 'react';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import 'ag-grid-enterprise';
import environment from './config';
import { checkStatus, genSortedColumns, toTitleCase } from './utils';
import apiName from './ApiName';
import { API } from 'aws-amplify';

export default class DetailCellRenderer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      masterRowData: props.data,
      caseData: null,
      colDefs: [],
      masterGridApi: props.api,
      metadata: props.metadata,
      table: props.table,
      rowIndex: props.rowIndex,
      extraHeight: 0
    };
    this.addExtraHeight = props.addExtraHeight;
    this.removeExtraHeight = props.removeExtraHeight;
    this.getExtraHeight = props.getExtraHeight;
  }

  componentDidMount() {
    // scroll page to show newly expanded row
    this.state.masterGridApi.ensureIndexVisible(this.state.rowIndex, 'top');

    const case_number = this.state.masterRowData.case_number;
    const t =
      this.state.table === 'cases'
        ? this.state.masterRowData.detail_loc.toLowerCase()
        : this.state.table.indexOf('_') === -1
        ? this.state.table
        : this.state.table.substring(0, this.state.table.indexOf('_'));
    let promise,
      path = `/v1/${t}/${case_number}/full`;
    if (environment === 'development') {
      promise = fetch(path)
        .then(checkStatus)
        .then(httpResponse => httpResponse.json());
    } else {
      promise = API.post(apiName, path);
    }
    promise
      .then(response => {
        this.setState({ caseData: response });
      })
      .catch(error => {
        console.error(error);
      });
  }

  getDetailGridId(subtable) {
    return `detailGrid_${this.state.masterRowData.case_number}_${subtable}_${this.state.rowIndex}`;
  }

  genDetailGrid(table, id, label, rowData) {
    const sortedColumns = genSortedColumns(this.state.metadata.columns, table);
    let detailGridColumns = [];
    for (const column of sortedColumns) {
      const metadata = column.metadata;
      let detailGridColumn;
      if (
        column.name.endsWith('_str') ||
        column.name === 'id' ||
        column.name === 'case_number'
      )
        continue;
      let columnLabel;
      if (metadata.label === '') columnLabel = toTitleCase(column.name);
      else columnLabel = metadata.label;
      const tooltipText = metadata.description;
      detailGridColumn = (
        <AgGridColumn
          field={column.name}
          headerName={columnLabel}
          headerTooltip={tooltipText}
          width={metadata.width_pixels === null ? 200 : metadata.width_pixels}
          key={table + '.' + column.name}
        />
      );
      detailGridColumns.push(detailGridColumn);
    }
    return (
      <div key={id}>
        <h3>{label}</h3>
        <div className={`case-detail-grid ${id}`}>
          <AgGridReact
            id={id}
            defaultColDef={{
              resizable: true
            }}
            rowData={rowData}
            onGridReady={this.setupDetailGrid(id)}
          >
            {detailGridColumns}
          </AgGridReact>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.caseData === null) {
      return (
        <div
          className="ag-theme-balham"
          style={{ height: '100%', backgroundColor: '#ecf0f1' }}
        >
          <div className="ag-stub-cell">
            <span className="ag-loading-icon" ref="eLoadingIcon">
              <span
                className="ag-icon ag-icon-loading"
                unselectable="on"
              ></span>
            </span>
            <span className="ag-loading-text" ref="eLoadingText">
              Loading...
            </span>
          </div>
        </div>
      );
    } else {
      let top_level = {},
        grids = [];
      for (const [subtable, val] of Object.entries(this.state.caseData)) {
        if (typeof val === 'string') top_level[subtable] = val;
        else if (Array.isArray(val) && val.length > 0) {
          const subtable_name = `${
            this.state.table === 'cases'
              ? this.state.masterRowData.detail_loc.toLowerCase()
              : this.state.table.indexOf('_') === -1
              ? this.state.table
              : this.state.table.substring(0, this.state.table.indexOf('_'))
          }_${subtable}`;
          const label = toTitleCase(subtable.replace('_', ' '));
          const detailGridId = this.getDetailGridId(subtable);
          grids.push(
            this.genDetailGrid(subtable_name, detailGridId, label, val)
          );
        }
      }
      let root_table = this.state.masterRowData.detail_loc
        ? this.state.masterRowData.detail_loc.toLowerCase()
        : this.state.table;
      if (root_table.indexOf('_') !== -1)
        root_table = root_table.substring(0, root_table.indexOf('_'));
      const genId = this.getDetailGridId('General');
      grids.unshift(
        this.genDetailGrid(
          root_table,
          genId,
          `Case Number ${this.state.masterRowData.case_number}`,
          [top_level]
        )
      );
      return <div className="case-details">{grids}</div>;
    }
  }

  setupDetailGrid(detailGridId) {
    return params => {
      let gridInfo = {
        id: detailGridId,
        api: params.api,
        columnApi: params.columnApi
      };

      this.state.masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
      const detailGrid = document.querySelector(
        `.${detailGridId}.case-detail-grid`
      );
      const detailGridRowsHeight = detailGrid.getElementsByClassName(
        'ag-center-cols-container'
      )[0].offsetHeight;
      const { rowHeight, headerHeight } = params.api.getSizesForCurrentTheme();
      const detailGridHeight = (detailGridRowsHeight + headerHeight + 1) / 0.96;
      // resize the detail grid and body viewport to fit the number of rows
      detailGrid.setAttribute('style', `height:${detailGridHeight}px`);
      detailGrid
        .querySelector('.ag-body-viewport')
        .setAttribute('style', `min-height:${detailGridRowsHeight}px`);

      // resize expanded row to fit all the detail grids and content
      const expandedRowHeight = detailGrid.closest('.case-details')
        .offsetHeight;
      detailGrid
        .closest('.ag-row')
        .setAttribute(
          'style',
          `min-height:${expandedRowHeight}px; transform: translateY(${this.state
            .rowIndex * rowHeight}px)`
        );

      // autoresize columns in detail grids
      params.columnApi.autoSizeAllColumns();

      // Collapse other expanded rows
      this.state.masterGridApi.forEachNode(node => {
        if (node.rowIndex !== this.state.rowIndex - 1 && node.expanded === true)
          node.expanded = false;
      });

      // scroll page to show newly expanded row
      setTimeout(() => {
        this.state.masterGridApi.ensureIndexVisible(
          this.state.rowIndex - 1,
          'top'
        );
      }, 500);
    };
  }
}
