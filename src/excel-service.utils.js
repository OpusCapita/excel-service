import { List } from 'immutable';

export const getColumns = (columns, visibleColumns) => {
  if (!List.isList(visibleColumns)) {
    return columns;
  }
  const newColumns = [];
  visibleColumns.forEach((key) => {
    const columnIndex = columns.findIndex(c => c.valueKeyPath.join('/') === key);
    if (columnIndex !== -1) {
      newColumns.push(columns[columnIndex]);
    }
  });
  return newColumns;
};

export const convertArrayBufferToString = (data) => {
  /* eslint-disable no-plusplus */
  const w = 10240;
  let str = '';
  let l = 0;
  for (l; l < data.byteLength / w; ++l) {
    str += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, (l * w) + w)));
  }
  str += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
  return str;
};

export const convertStringToArrayBuffer = (str) => {
  /* eslint-disable no-bitwise */
  const buf = new ArrayBuffer(str.length);
  const view = new Uint8Array(buf);
  [...str].forEach((ch, i) => {
    view[i] = str.charCodeAt(i) & 0xFF;
  });
  return buf;
};

export const convertValueType = (value, type) => {
  const VALUE_TYPES = {
    number: 'number',
    string: 'string',
  };
  switch (type) {
    case VALUE_TYPES.number:
      return Number(value);
    default:
      return String(value);
  }
};
