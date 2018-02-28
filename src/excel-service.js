/* eslint-disable no-underscore-dangle */
import XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  getColumns,
  convertArrayBufferToString,
  convertStringToArrayBuffer,
  convertValueType,
} from './excel-service.utils';

const createWorksheet = (data, columns, digits) => {
  XLSX.SSF._table[161] = '0.0';
  XLSX.SSF._table[162] = '0.000';
  XLSX.SSF._table[163] = '0.0000';
  XLSX.SSF._table[164] = '0.00000';
  XLSX.SSF._table[165] = '0.000000';
  const sheet = {};
  const sheetColumns = [];
  const range = { s: { c: 0, r: 0 }, e: { c: columns.length - 1, r: data.size } };
  let cellRef = {};
  columns.forEach((col, colIndex) => {
    cellRef = XLSX.utils.encode_cell({ c: colIndex, r: 0 });
    const header = col.headerText ? String(col.headerText) : String(col.header);
    sheet[cellRef] = { t: 's', v: header };
    sheetColumns.push({ wpx: col.width });
  });
  data.forEach((row, rowIndex) => {
    columns.forEach((col, colIndex) => {
      let cellData = col.valueKeyPath ? row.getIn(col.valueKeyPath) : '';
      if (col.valueRender !== undefined && !col.disableValueRenderInExcel) {
        cellData = String(col.valueRender(row));
      }
      if (col.valueTypeExcel) {
        cellData = convertValueType(cellData, col.valueTypeExcel);
      }
      if (cellData === null || cellData === undefined) {
        cellData = '';
      }
      const cell = { v: cellData };
      cellRef = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex + 1 });
      if (typeof cell.v === 'number') {
        cell.t = 'n';
        if (Array.isArray(digits) && Number(digits[rowIndex][col.valueKeyPath.join('/')]) > -1) {
          cell.z = Number(XLSX.SSF._table[2]).toFixed(digits[rowIndex][col.valueKeyPath.join('/')]);
        } else if (Number(digits) > -1) {
          cell.z = Number(XLSX.SSF._table[2]).toFixed(digits);
        }
      } else if (typeof cell.v === 'boolean') {
        cell.t = 'b';
      } else {
        cell.t = 's';
      }
      sheet[cellRef] = cell;
    });
  });
  sheet['!cols'] = sheetColumns;
  sheet['!ref'] = XLSX.utils.encode_range(range);
  return sheet;
};

/**
 * Export data to Excel
 * Input:
 * data is a List of data to export,
 * columns is an array of column objects with the keys:
 * {
 *  disableValueRenderInExcel :: bool, optional, disable valueRender callback for export to Excel,
 *    instead export value directly
 *  headerText :: string, needed if 'header' is not a text,
 *  valueKeyPath :: array of strings,
 *  valueRender :: function, optional,
 *  valueType :: string, defines a value type in UI
 *  valueTypeExcel :: string, optional, defines a value type for Excel if differs from UI
 *  width :: number, width in pixels,
 * },
 * fileName is a file name string (optional),
 * digits is a number of digits for decimals in all table or an array containing digits
 * for cells (optional),
 * visibleColumns is a list of visible columns in case column settings is used (optional).
 */
export const exportToExcel = (data, columns, fileName = 'Export From OC', digits = null, visibleColumns = null) => {
  const sheetName = 'Sheet1';
  const exportedColumns = getColumns(columns, visibleColumns);
  const sheet = createWorksheet(data, exportedColumns, digits);
  const book = { SheetNames: [sheetName], Sheets: {} };
  book.Sheets[sheetName] = sheet;
  const bookOut = XLSX.write(book, { bookType: 'xlsx', bookSST: true, type: 'binary' });
  console.log(book, bookOut, convertStringToArrayBuffer(bookOut));
  saveAs(new Blob([convertStringToArrayBuffer(bookOut)], { type: 'application/octet-stream' }), `${fileName}.xlsx`);
};

/**
 * Import data from Excel
 * Input:
 * files is an event.target.files array,
 * callback is onLoad callback called from a parent component,
 * alertCallback is a callback for error alert (optional).
 */
export const importFromExcel = (files, callback, alertCallback = null) => {
  if (files.length === 0) {
    return;
  }
  if (alertCallback && files[0].type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    alertCallback();
    return;
  }
  const reader = new FileReader();
  reader.onload = callback;
  reader.readAsArrayBuffer(files[0]);
};

/**
 * Callback on load of FileReader for import operation
 * Input:
 * e is an event object,
 * columns is an array of column objects with the keys:
 * {
 *  valueKeyPath :: array of strings,
 *  valueExcelMatch :: function (optional),
 *  defaultValue :: any,
 * },
 * visibleColumns is a list of visible columns ids in case column settings is used (optional).
 * Output:
 * an array of data.
 */
export const onLoadCallback = (e, columns, visibleColumns = null) => {
  const result = convertArrayBufferToString(e.target.result);
  const book = XLSX.read(btoa(result), { type: 'base64' });
  const rawData =
    XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, raw: true });
  if (Array.isArray(rawData) && rawData.length < 2) {
    return [];
  }
  const importedColumns = getColumns(columns, visibleColumns);
  const data = [];
  rawData.forEach((row, rowIndex) => {
    // skip the header
    if (rowIndex >= 1) {
      const item = {};
      row.forEach((cell, cellIndex) => {
        if (cellIndex < importedColumns.length) {
          const value = importedColumns[cellIndex].valueExcelMatch !== undefined ?
            importedColumns[cellIndex].valueExcelMatch(cell) : cell;
          item[importedColumns[cellIndex].valueKeyPath[0]] = value;
        }
      });
      importedColumns.forEach((column) => {
        if (column.defaultValue !== undefined && item[column.valueKeyPath[0]] === undefined) {
          item[column.valueKeyPath[0]] = column.defaultValue;
        }
      });
      data.push(item);
    }
  });
  return data;
};
