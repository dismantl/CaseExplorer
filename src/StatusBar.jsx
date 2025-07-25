import React from 'react';
import environment from './config';
import { checkStatus } from './utils';
import { API } from 'aws-amplify';
import apiName from './ApiName';
import { numberWithCommas } from './utils';

export default class CustomStatusBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      table: props.table,
      fetching: false,
      currentParams: null,
      byCop: props.byCop,
      seq: props.seq
    };
  }

  componentDidMount() {
    const path = this.state.byCop
      ? `/api/v1/bpd/seq/${this.state.seq}/total`
      : `/api/v1/${this.state.table}/total`;
    let promise;
    if (environment === 'amplify') {
      promise = API.get(apiName, path);
    } else {
      promise = fetch(path)
        .then(checkStatus)
        .then(httpResponse => httpResponse.json());
    }
    promise
      .then(response => {
        this.setState({ count: numberWithCommas(response) });
      })
      .catch(error => {
        console.error(error);
      });
  }

  updateTotal(params) {
    this.setState({ filtered: true, fetching: true, currentParams: params });
    const path = this.state.byCop
      ? `/api/v1/bpd/seq/${this.state.seq}/total`
      : `/api/v1/${this.state.table}/filtered/total`;
    let countPromise;
    if (environment === 'amplify') {
      countPromise = API.post(apiName, path, {
        body: params.request
      });
    } else {
      countPromise = fetch(path, {
        method: 'post',
        body: JSON.stringify(params.request),
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }).then(checkStatus);
    }
    countPromise
      .then(response => {
        if (typeof response.json === 'function') return response.json();
        else return response;
      })
      .then(response => {
        if (params === this.state.currentParams)
          this.setState({
            count: numberWithCommas(response),
            fetching: false
          });
      })
      .catch(error => {
        console.error(error);
        // params.fail();
      });
  }

  render() {
    return (
      <div className="ag-status-bar-center">
        <div className="ag-status-name-value ag-status-panel ag-status-panel-total-row-count">
          <span className="label">
            {this.state.currentParams ? ' ' : 'Approximate '}Total Rows
          </span>
          :&nbsp;
          <span id="total-row-count" className="ag-status-name-value-value">
            {this.state.fetching ? (
              <span className="ag-loading-icon" ref="eLoadingIcon">
                <span
                  className="ag-icon ag-icon-loading"
                  unselectable="on"
                  role="presentation"
                ></span>
              </span>
            ) : (
              this.state.count
            )}
          </span>
        </div>
      </div>
    );
  }
}
