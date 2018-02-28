'use strict';

exports.__esModule = true;
exports.onLoadCallback = exports.importFromExcel = exports.exportToExcel = undefined;

var _xlsx = require('xlsx');

var _xlsx2 = _interopRequireDefault(_xlsx);

var _fileSaver = require('file-saver');

var _excelService = require('./excel-service.utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createWorksheet = function createWorksheet(data, columns, digits) {
  _xlsx2.default.SSF._table[161] = '0.0';
  _xlsx2.default.SSF._table[162] = '0.000';
  _xlsx2.default.SSF._table[163] = '0.0000';
  _xlsx2.default.SSF._table[164] = '0.00000';
  _xlsx2.default.SSF._table[165] = '0.000000';
  var sheet = {};
  var sheetColumns = [];
  var range = { s: { c: 0, r: 0 }, e: { c: columns.length - 1, r: data.size } };
  var cellRef = {};
  columns.forEach(function (col, colIndex) {
    cellRef = _xlsx2.default.utils.encode_cell({ c: colIndex, r: 0 });
    var header = col.headerText ? String(col.headerText) : String(col.header);
    sheet[cellRef] = { t: 's', v: header };
    sheetColumns.push({ wpx: col.width });
  });
  data.forEach(function (row, rowIndex) {
    columns.forEach(function (col, colIndex) {
      var cellData = col.valueKeyPath ? row.getIn(col.valueKeyPath) : '';
      if (col.valueRender !== undefined && !col.disableValueRenderInExcel) {
        cellData = String(col.valueRender(row));
      }
      if (col.valueTypeExcel) {
        cellData = (0, _excelService.convertValueType)(cellData, col.valueTypeExcel);
      }
      if (cellData === null || cellData === undefined) {
        cellData = '';
      }
      var cell = { v: cellData };
      cellRef = _xlsx2.default.utils.encode_cell({ c: colIndex, r: rowIndex + 1 });
      if (typeof cell.v === 'number') {
        cell.t = 'n';
        if (Array.isArray(digits) && Number(digits[rowIndex][col.valueKeyPath.join('/')]) > -1) {
          cell.z = Number(_xlsx2.default.SSF._table[2]).toFixed(digits[rowIndex][col.valueKeyPath.join('/')]);
        } else if (Number(digits) > -1) {
          cell.z = Number(_xlsx2.default.SSF._table[2]).toFixed(digits);
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
  sheet['!ref'] = _xlsx2.default.utils.encode_range(range);
  return sheet;
};

/**
 * Export data to Excel
 * Input:
 * data is a List of data to export,
 * columns is an array of column objects with the keys:
 * {
 *  header :: string or element, defines the column name,
 *  valueKeyPath :: array of strings, defines the column id,
 *  width :: number, width in pixels,
 *  disableValueRenderInExcel :: bool (optional), disable valueRender callback for export to Excel,
 *    instead export value directly
 *  headerText :: string (optional), needed if 'header' is not a text,
 *  valueRender :: function (optional), defines a render function,
 *  valueTypeExcel :: string (optional), defines a value type for Excel if differs from UI
 * },
 * fileName is a file name string (optional),
 * digits is a number of digits for decimals in all table or an array containing digits
 * for cells (optional),
 * visibleColumns is a list of visible columns in case column settings is used (optional).
 */
/* eslint-disable no-underscore-dangle */
var exportToExcel = exports.exportToExcel = function exportToExcel(data, columns) {
  var fileName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Export From OC';
  var digits = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var visibleColumns = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

  var sheetName = 'Sheet1';
  var exportedColumns = (0, _excelService.getColumns)(columns, visibleColumns);
  var sheet = createWorksheet(data, exportedColumns, digits);
  var book = { SheetNames: [sheetName], Sheets: {} };
  book.Sheets[sheetName] = sheet;
  var bookOut = _xlsx2.default.write(book, { bookType: 'xlsx', bookSST: true, type: 'binary' });
  // console.log(book, bookOut, convertStringToArrayBuffer(bookOut));
  (0, _fileSaver.saveAs)(new Blob([(0, _excelService.convertStringToArrayBuffer)(bookOut)], { type: 'application/octet-stream' }), fileName + '.xlsx');
};

/**
 * Import data from Excel
 * Input:
 * files is an event.target.files array,
 * callback is onLoad callback called from a parent component,
 * alertCallback is a callback for error alert (optional).
 */
var importFromExcel = exports.importFromExcel = function importFromExcel(files, callback) {
  var alertCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (files.length === 0) {
    return;
  }
  if (alertCallback && files[0].type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    alertCallback();
    return;
  }
  var reader = new FileReader();
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
var onLoadCallback = exports.onLoadCallback = function onLoadCallback(e, columns) {
  var visibleColumns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var result = (0, _excelService.convertArrayBufferToString)(e.target.result);
  var book = _xlsx2.default.read(btoa(result), { type: 'base64' });
  var rawData = _xlsx2.default.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, raw: true });
  if (Array.isArray(rawData) && rawData.length < 2) {
    return [];
  }
  var importedColumns = (0, _excelService.getColumns)(columns, visibleColumns);
  var data = [];
  rawData.forEach(function (row, rowIndex) {
    // skip the header
    if (rowIndex >= 1) {
      var item = {};
      row.forEach(function (cell, cellIndex) {
        if (cellIndex < importedColumns.length) {
          var value = importedColumns[cellIndex].valueExcelMatch !== undefined ? importedColumns[cellIndex].valueExcelMatch(cell) : cell;
          item[importedColumns[cellIndex].valueKeyPath[0]] = value;
        }
      });
      importedColumns.forEach(function (column) {
        if (column.defaultValue !== undefined && item[column.valueKeyPath[0]] === undefined) {
          item[column.valueKeyPath[0]] = column.defaultValue;
        }
      });
      data.push(item);
    }
  });
  return data;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leGNlbC1zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbImNyZWF0ZVdvcmtzaGVldCIsImRhdGEiLCJjb2x1bW5zIiwiZGlnaXRzIiwiU1NGIiwiX3RhYmxlIiwic2hlZXQiLCJzaGVldENvbHVtbnMiLCJyYW5nZSIsInMiLCJjIiwiciIsImUiLCJsZW5ndGgiLCJzaXplIiwiY2VsbFJlZiIsImZvckVhY2giLCJjb2wiLCJjb2xJbmRleCIsInV0aWxzIiwiZW5jb2RlX2NlbGwiLCJoZWFkZXIiLCJoZWFkZXJUZXh0IiwiU3RyaW5nIiwidCIsInYiLCJwdXNoIiwid3B4Iiwid2lkdGgiLCJyb3ciLCJyb3dJbmRleCIsImNlbGxEYXRhIiwidmFsdWVLZXlQYXRoIiwiZ2V0SW4iLCJ2YWx1ZVJlbmRlciIsInVuZGVmaW5lZCIsImRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwiLCJ2YWx1ZVR5cGVFeGNlbCIsImNlbGwiLCJBcnJheSIsImlzQXJyYXkiLCJOdW1iZXIiLCJqb2luIiwieiIsInRvRml4ZWQiLCJlbmNvZGVfcmFuZ2UiLCJleHBvcnRUb0V4Y2VsIiwiZmlsZU5hbWUiLCJ2aXNpYmxlQ29sdW1ucyIsInNoZWV0TmFtZSIsImV4cG9ydGVkQ29sdW1ucyIsImJvb2siLCJTaGVldE5hbWVzIiwiU2hlZXRzIiwiYm9va091dCIsIndyaXRlIiwiYm9va1R5cGUiLCJib29rU1NUIiwidHlwZSIsIkJsb2IiLCJpbXBvcnRGcm9tRXhjZWwiLCJmaWxlcyIsImNhbGxiYWNrIiwiYWxlcnRDYWxsYmFjayIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJyZWFkQXNBcnJheUJ1ZmZlciIsIm9uTG9hZENhbGxiYWNrIiwicmVzdWx0IiwidGFyZ2V0IiwicmVhZCIsImJ0b2EiLCJyYXdEYXRhIiwic2hlZXRfdG9fanNvbiIsInJhdyIsImltcG9ydGVkQ29sdW1ucyIsIml0ZW0iLCJjZWxsSW5kZXgiLCJ2YWx1ZSIsInZhbHVlRXhjZWxNYXRjaCIs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LFlBQVAsQ0FBb0IsQ0FBcEIsQ0FBTCxNQUFpQ0csU0FBMUUsRUFBcUY7QUFDbkYwQyxlQUFLSSxPQUFPakQsWUFBUCxDQUFvQixDQUFwQixDQUFMLElBQStCaUQsT0FBT0MsWUFBdEM7QUFDRDtBQUNGLE9BSkQ7QUFLQWpGLFdBQUt5QixJQUFMLENBQVVtRCxJQUFWO0FBQ0Q7QUFDRixHQWxCRDtBQW1CQSxTQUFPNUUsSUFBUDtBQUNELENBOUJNIiwiZmlsZSI6ImV4Y2VsLXNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlcnNjb3JlLWRhbmdsZSAqL1xuaW1wb3J0IFhMU1ggZnJvbSAneGxzeCc7XG5pbXBvcnQgeyBzYXZlQXMgfSBmcm9tICdmaWxlLXNhdmVyJztcblxuaW1wb3J0IHtcbiAgZ2V0Q29sdW1ucyxcbiAgY29udmVydEFycmF5QnVmZmVyVG9TdHJpbmcsXG4gIGNvbnZlcnRTdHJpbmdUb0FycmF5QnVmZmVyLFxuICBjb252ZXJ0VmFsdWVUeXBlLFxufSBmcm9tICcuL2V4Y2VsLXNlcnZpY2UudXRpbHMnO1xuXG5jb25zdCBjcmVhdGVXb3Jrc2hlZXQgPSAoZGF0YSwgY29sdW1ucywgZGlnaXRzKSA9PiB7XG4gIFhMU1guU1NGLl90YWJsZVsxNjFdID0gJzAuMCc7XG4gIFhMU1guU1NGLl90YWJsZVsxNjJdID0gJzAuMDAwJztcbiAgWExTWC5TU0YuX3RhYmxlWzE2M10gPSAnMC4wMDAwJztcbiAgWExTWC5TU0YuX3RhYmxlWzE2NF0gPSAnMC4wMDAwMCc7XG4gIFhMU1guU1NGLl90YWJsZVsxNjVdID0gJzAuMDAwMDAwJztcbiAgY29uc3Qgc2hlZXQgPSB7fTtcbiAgY29uc3Qgc2hlZXRDb2x1bW5zID0gW107XG4gIGNvbnN0IHJhbmdlID0geyBzOiB7IGM6IDAsIHI6IDAgfSwgZTogeyBjOiBjb2x1bW5zLmxlbmd0aCAtIDEsIHI6IGRhdGEuc2l6ZSB9IH07XG4gIGxldCBjZWxsUmVmID0ge307XG4gIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBjb2xJbmRleCkgPT4ge1xuICAgIGNlbGxSZWYgPSBYTFNYLnV0aWxzLmVuY29kZV9jZWxsKHsgYzogY29sSW5kZXgsIHI6IDAgfSk7XG4gICAgY29uc3QgaGVhZGVyID0gY29sLmhlYWRlclRleHQgPyBTdHJpbmcoY29sLmhlYWRlclRleHQpIDogU3RyaW5nKGNvbC5oZWFkZXIpO1xuICAgIHNoZWV0W2NlbGxSZWZdID0geyB0OiAncycsIHY6IGhlYWRlciB9O1xuICAgIHNoZWV0Q29sdW1ucy5wdXNoKHsgd3B4OiBjb2wud2lkdGggfSk7XG4gIH0pO1xuICBkYXRhLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICBjb2x1bW5zLmZvckVhY2goKGNvbCwgY29sSW5kZXgpID0+IHtcbiAgICAgIGxldCBjZWxsRGF0YSA9IGNvbC52YWx1ZUtleVBhdGggPyByb3cuZ2V0SW4oY29sLnZhbHVlS2V5UGF0aCkgOiAnJztcbiAgICAgIGlmIChjb2wudmFsdWVSZW5kZXIgIT09IHVuZGVmaW5lZCAmJiAhY29sLmRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwpIHtcbiAgICAgICAgY2VsbERhdGEgPSBTdHJpbmcoY29sLnZhbHVlUmVuZGVyKHJvdykpO1xuICAgICAgfVxuICAgICAgaWYgKGNvbC52YWx1ZVR5cGVFeGNlbCkge1xuICAgICAgICBjZWxsRGF0YSA9IGNvbnZlcnRWYWx1ZVR5cGUoY2VsbERhdGEsIGNvbC52YWx1ZVR5cGVFeGNlbCk7XG4gICAgICB9XG4gICAgICBpZiAoY2VsbERhdGEgPT09IG51bGwgfHwgY2VsbERhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjZWxsRGF0YSA9ICcnO1xuICAgICAgfVxuICAgICAgY29uc3QgY2VsbCA9IHsgdjogY2VsbERhdGEgfTtcbiAgICAgIGNlbGxSZWYgPSBYTFNYLnV0aWxzLmVuY29kZV9jZWxsKHsgYzogY29sSW5kZXgsIHI6IHJvd0luZGV4ICsgMSB9KTtcbiAgICAgIGlmICh0eXBlb2YgY2VsbC52ID09PSAnbnVtYmVyJykge1xuICAgICAgICBjZWxsLnQgPSAnbic7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRpZ2l0cykgJiYgTnVtYmVyKGRpZ2l0c1tyb3dJbmRleF1bY29sLnZhbHVlS2V5UGF0aC5qb2luKCcvJyldKSA+IC0xKSB7XG4gICAgICAgICAgY2VsbC56ID0gTnVtYmVyKFhMU1guU1NGLl90YWJsZVsyXSkudG9GaXhlZChkaWdpdHNbcm93SW5kZXhdW2NvbC52YWx1ZUtleVBhdGguam9pbignLycpXSk7XG4gICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGRpZ2l0cykgPiAtMSkge1xuICAgICAgICAgIGNlbGwueiA9IE51bWJlcihYTFNYLlNTRi5fdGFibGVbMl0pLnRvRml4ZWQoZGlnaXRzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbC52ID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgY2VsbC50ID0gJ2InO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2VsbC50ID0gJ3MnO1xuICAgICAgfVxuICAgICAgc2hlZXRbY2VsbFJlZl0gPSBjZWxsO1xuICAgIH0pO1xuICB9KTtcbiAgc2hlZXRbJyFjb2xzJ10gPSBzaGVldENvbHVtbnM7XG4gIHNoZWV0WychcmVmJ10gPSBYTFNYLnV0aWxzLmVuY29kZV9yYW5nZShyYW5nZSk7XG4gIHJldHVybiBzaGVldDtcbn07XG5cbi8qKlxuICogRXhwb3J0IGRhdGEgdG8gRXhjZWxcbiAqIElucHV0OlxuICogZGF0YSBpcyBhIExpc3Qgb2YgZGF0YSB0byBleHBvcnQsXG4gKiBjb2x1bW5zIGlzIGFuIGFycmF5IG9mIGNvbHVtbiBvYmplY3RzIHdpdGggdGhlIGtleXM6XG4gKiB7XG4gKiAgaGVhZGVyIDo6IHN0cmluZyBvciBlbGVtZW50LCBkZWZpbmVzIHRoZSBjb2x1bW4gbmFtZSxcbiAqICB2YWx1ZUtleVBhdGggOjogYXJyYXkgb2Ygc3RyaW5ncywgZGVmaW5lcyB0aGUgY29sdW1uIGlkLFxuICogIHdpZHRoIDo6IG51bWJlciwgd2lkdGggaW4gcGl4ZWxzLFxuICogIGRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwgOjogYm9vbCAob3B0aW9uYWwpLCBkaXNhYmxlIHZhbHVlUmVuZGVyIGNhbGxiYWNrIGZvciBleHBvcnQgdG8gRXhjZWwsXG4gKiAgICBpbnN0ZWFkIGV4cG9ydCB2YWx1ZSBkaXJlY3RseVxuICogIGhlYWRlclRleHQgOjogc3RyaW5nIChvcHRpb25hbCksIG5lZWRlZCBpZiAnaGVhZGVyJyBpcyBub3QgYSB0ZXh0LFxuICogIHZhbHVlUmVuZGVyIDo6IGZ1bmN0aW9uIChvcHRpb25hbCksIGRlZmluZXMgYSByZW5kZXIgZnVuY3Rpb24sXG4gKiAgdmFsdWVUeXBlRXhjZWwgOjogc3RyaW5nIChvcHRpb25hbCksIGRlZmluZXMgYSB2YWx1ZSB0eXBlIGZvciBFeGNlbCBpZiBkaWZmZXJzIGZyb20gVUlcbiAqIH0sXG4gKiBmaWxlTmFtZSBpcyBhIGZpbGUgbmFtZSBzdHJpbmcgKG9wdGlvbmFsKSxcbiAqIGRpZ2l0cyBpcyBhIG51bWJlciBvZiBkaWdpdHMgZm9yIGRlY2ltYWxzIGluIGFsbCB0YWJsZSBvciBhbiBhcnJheSBjb250YWluaW5nIGRpZ2l0c1xuICogZm9yIGNlbGxzIChvcHRpb25hbCksXG4gKiB2aXNpYmxlQ29sdW1ucyBpcyBhIGxpc3Qgb2YgdmlzaWJsZSBjb2x1bW5zIGluIGNhc2UgY29sdW1uIHNldHRpbmdzIGlzIHVzZWQgKG9wdGlvbmFsKS5cbiAqL1xuZXhwb3J0IGNvbnN0IGV4cG9ydFRvRXhjZWwgPSAoZGF0YSwgY29sdW1ucywgZmlsZU5hbWUgPSAnRXhwb3J0IEZyb20gT0MnLCBkaWdpdHMgPSBudWxsLCB2aXNpYmxlQ29sdW1ucyA9IG51bGwpID0+IHtcbiAgY29uc3Qgc2hlZXROYW1lID0gJ1NoZWV0MSc7XG4gIGNvbnN0IGV4cG9ydGVkQ29sdW1ucyA9IGdldENvbHVtbnMoY29sdW1ucywgdmlzaWJsZUNvbHVtbnMpO1xuICBjb25zdCBzaGVldCA9IGNyZWF0ZVdvcmtzaGVldChkYXRhLCBleHBvcnRlZENvbHVtbnMsIGRpZ2l0cyk7XG4gIGNvbnN0IGJvb2sgPSB7IFNoZWV0TmFtZXM6IFtzaGVldE5hbWVdLCBTaGVldHM6IHt9IH07XG4gIGJvb2suU2hlZXRzW3NoZWV0TmFtZV0gPSBzaGVldDtcbiAgY29uc3QgYm9va091dCA9IFhMU1gud3JpdGUoYm9vaywgeyBib29rVHlwZTogJ3hsc3gnLCBib29rU1NUOiB0cnVlLCB0eXBlOiAnYmluYXJ5JyB9KTtcbiAgLy8gY29uc29sZS5sb2coYm9vaywgYm9va091dCwgY29udmVydFN0cmluZ1RvQXJyYXlCdWZmZXIoYm9va091dCkpO1xuICBzYXZlQXMobmV3IEJsb2IoW2NvbnZlcnRTdHJpbmdUb0FycmF5QnVmZmVyKGJvb2tPdXQpXSwgeyB0eXBlOiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyB9KSwgYCR7ZmlsZU5hbWV9Lnhsc3hgKTtcbn07XG5cbi8qKlxuICogSW1wb3J0IGRhdGEgZnJvbSBFeGNlbFxuICogSW5wdXQ6XG4gKiBmaWxlcyBpcyBhbiBldmVudC50YXJnZXQuZmlsZXMgYXJyYXksXG4gKiBjYWxsYmFjayBpcyBvbkxvYWQgY2FsbGJhY2sgY2FsbGVkIGZyb20gYSBwYXJlbnQgY29tcG9uZW50LFxuICogYWxlcnRDYWxsYmFjayBpcyBhIGNhbGxiYWNrIGZvciBlcnJvciBhbGVydCAob3B0aW9uYWwpLlxuICovXG5leHBvcnQgY29uc3QgaW1wb3J0RnJvbUV4Y2VsID0gKGZpbGVzLCBjYWxsYmFjaywgYWxlcnRDYWxsYmFjayA9IG51bGwpID0+IHtcbiAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoYWxlcnRDYWxsYmFjayAmJiBmaWxlc1swXS50eXBlICE9PSAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXQnKSB7XG4gICAgYWxlcnRDYWxsYmFjaygpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICByZWFkZXIub25sb2FkID0gY2FsbGJhY2s7XG4gIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihmaWxlc1swXSk7XG59O1xuXG4vKipcbiAqIENhbGxiYWNrIG9uIGxvYWQgb2YgRmlsZVJlYWRlciBmb3IgaW1wb3J0IG9wZXJhdGlvblxuICogSW5wdXQ6XG4gKiBlIGlzIGFuIGV2ZW50IG9iamVjdCxcbiAqIGNvbHVtbnMgaXMgYW4gYXJyYXkgb2YgY29sdW1uIG9iamVjdHMgd2l0aCB0aGUga2V5czpcbiAqIHtcbiAqICB2YWx1ZUtleVBhdGggOjogYXJyYXkgb2Ygc3RyaW5ncyxcbiAqICB2YWx1ZUV4Y2VsTWF0Y2ggOjogZnVuY3Rpb24gKG9wdGlvbmFsKSxcbiAqICBkZWZhdWx0VmFsdWUgOjogYW55LFxuICogfSxcbiAqIHZpc2libGVDb2x1bW5zIGlzIGEgbGlzdCBvZiB2aXNpYmxlIGNvbHVtbnMgaWRzIGluIGNhc2UgY29sdW1uIHNldHRpbmdzIGlzIHVzZWQgKG9wdGlvbmFsKS5cbiAqIE91dHB1dDpcbiAqIGFuIGFycmF5IG9mIGRhdGEuXG4gKi9cbmV4cG9ydCBjb25zdCBvbkxvYWRDYWxsYmFjayA9IChlLCBjb2x1bW5zLCB2aXNpYmxlQ29sdW1ucyA9IG51bGwpID0+IHtcbiAgY29uc3QgcmVzdWx0ID0gY29udmVydEFycmF5QnVmZmVyVG9TdHJpbmcoZS50YXJnZXQucmVzdWx0KTtcbiAgY29uc3QgYm9vayA9IFhMU1gucmVhZChidG9hKHJlc3VsdCksIHsgdHlwZTogJ2Jhc2U2NCcgfSk7XG4gIGNvbnN0IHJhd0RhdGEgPVxuICAgIFhMU1gudXRpbHMuc2hlZXRfdG9fanNvbihib29rLlNoZWV0c1tib29rLlNoZWV0TmFtZXNbMF1dLCB7IGhlYWRlcjogMSwgcmF3OiB0cnVlIH0pO1xuICBpZiAoQXJyYXkuaXNBcnJheShyYXdEYXRhKSAmJiByYXdEYXRhLmxlbmd0aCA8IDIpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgY29uc3QgaW1wb3J0ZWRDb2x1bW5zID0gZ2V0Q29sdW1ucyhjb2x1bW5zLCB2aXNpYmxlQ29sdW1ucyk7XG4gIGNvbnN0IGRhdGEgPSBbXTtcbiAgcmF3RGF0YS5mb3JFYWNoKChyb3csIHJvd0luZGV4KSA9PiB7XG4gICAgLy8gc2tpcCB0aGUgaGVhZGVyXG4gICAgaWYgKHJvd0luZGV4ID49IDEpIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSB7fTtcbiAgICAgIHJvdy5mb3JFYWNoKChjZWxsLCBjZWxsSW5kZXgpID0+IHtcbiAgICAgICAgaWYgKGNlbGxJbmRleCA8IGltcG9ydGVkQ29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IGltcG9ydGVkQ29sdW1uc1tjZWxsSW5kZXhdLnZhbHVlRXhjZWxNYXRjaCAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgICAgIGltcG9ydGVkQ29sdW1uc1tjZWxsSW5kZXhdLnZhbHVlRXhjZWxNYXRjaChjZWxsKSA6IGNlbGw7XG4gICAgICAgICAgaXRlbVtpbXBvcnRlZENvbHVtbnNbY2VsbEluZGV4XS52YWx1ZUtleVBhdGhbMF1dID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaW1wb3J0ZWRDb2x1bW5zLmZvckVhY2goKGNvbHVtbikgPT4ge1xuICAgICAgICBpZiAoY29sdW1uLmRlZmF1bHRWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIGl0ZW1bY29sdW1uLnZhbHVlS2V5UGF0aFswXV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGl0ZW1bY29sdW1uLnZhbHVlS2V5UGF0aFswXV0gPSBjb2x1bW4uZGVmYXVsdFZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGRhdGEucHVzaChpdGVtKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZGF0YTtcbn07XG4iXX0=