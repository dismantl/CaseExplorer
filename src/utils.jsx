export const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error); // eslint-disable-line no-console
  throw error;
};

export const toTitleCase = str => {
  return str
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    })
    .replace(/ Id$/, ' ID')
    .replace('Cjis', 'CJIS')
    .replace('Dob', 'DOB');
};

export const numberWithCommas = x => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getURLLastPart = () => {
  return window.location.href.substring(
    window.location.href.lastIndexOf('/') + 1
  );
};

export const genSortedColumns = (metadata, table) => {
  let sortedColumns = [];
  const table_metadata = metadata[table];
  for (const [column, column_metadata] of Object.entries(table_metadata)) {
    if (sortedColumns.length === 0)
      sortedColumns.push({ name: column, metadata: column_metadata });
    else {
      let inserted = false;
      for (let i = 0; i < sortedColumns.length; i++) {
        if (column_metadata.order < sortedColumns[i].metadata.order) {
          sortedColumns.splice(i, 0, {
            name: column,
            metadata: column_metadata
          });
          inserted = true;
          break;
        }
      }
      if (inserted === false)
        sortedColumns.push({ name: column, metadata: column_metadata });
    }
  }
  return sortedColumns;
};
