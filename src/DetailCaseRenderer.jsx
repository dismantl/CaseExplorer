import React, { Component } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import environment from './config';
import { checkStatus } from './utils';
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
    const case_number = this.state.masterRowData.case_number;
    console.log(`Mounted ${case_number}`);
    const t =
      this.state.table === 'cases'
        ? this.state.masterRowData.detail_loc.toLowerCase()
        : this.state.table;
    let promise,
      path = `/api/${t}/${case_number}/full`;
    if (environment === 'development') {
      promise = fetch(path)
        .then(checkStatus)
        .then(httpResponse => httpResponse.json());
    } else {
      promise = API.post(apiName, path);
    }
    promise
      .then(response => {
        console.log(`Fetched and setting case data for ${case_number}`);
        this.setState({ caseData: response });
      })
      .catch(error => {
        console.error(error);
        // params.fail();
      });
  }

  getDetailGridId(subtable) {
    return `detailGrid_${this.state.masterRowData.case_number}_${subtable}`;
  }

  render() {
    if (this.state.caseData === null) {
      return (
        <div className="ag-theme-balham" style={{ height: '100%' }}>
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
          const first = val[0];
          let colDefs = [];
          for (const property in first) {
            if (
              property !== 'id' &&
              property !== 'aliases' &&
              property !== 'attorneys'
            )
              colDefs.push({ field: property });
          }
          const detailGridId = this.getDetailGridId(subtable);
          grids.push(
            <>
              <h3>{subtable}</h3>
              <div
                className={`case-detail-grid ${detailGridId}`}
                key={detailGridId}
              >
                <AgGridReact
                  id={detailGridId}
                  columnDefs={colDefs}
                  rowData={val}
                  onGridReady={this.setupDetailGrid(detailGridId)}
                />
              </div>
            </>
          );
        }
      }
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

      console.log('adding detail grid info with id: ', detailGridId);
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
      // TODO translateY needs to take into account if any other rows are expanded
      const extraHeight = expandedRowHeight - rowHeight;
      console.log(`Total extra height before adding: ${this.getExtraHeight()}`);
      this.addExtraHeight(extraHeight);
      console.log(`Adding ${extraHeight}`);
      this.setState({ extraHeight: extraHeight });
      const totalExtraHeight = this.getExtraHeight();
      console.log(`Total extra height after adding: ${totalExtraHeight}`);
      detailGrid
        .closest('.ag-row')
        .setAttribute(
          'style',
          `min-height:${expandedRowHeight}px; transform: translateY(${this.state
            .rowIndex *
            rowHeight +
            totalExtraHeight}px)`
        );
      // detailGrid.closest('.ag-row').setAttribute('style',`min-height:${expandedRowHeight}px; transform: translateY(${this.state.rowIndex*rowHeight}px)`);
    };
  }

  componentWillUnmount() {
    console.log(`Total extra height before removal: ${this.getExtraHeight()}`);
    console.log(`Removing ${this.state.extraHeight}`);
    this.removeExtraHeight(this.state.extraHeight);
    console.log(`Total extra height after removal: ${this.getExtraHeight()}`);
  }
}
