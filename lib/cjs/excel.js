'use strict';

exports.__esModule = true;

var _xlsx = require('xlsx');

var _xlsx2 = _interopRequireDefault(_xlsx);

var _excel = require('./excel.utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Excel = function Excel() {
  var _this = this;

  _classCallCheck(this, Excel);

  this.createWorksheet = function (data, columns, digits) {
    /* eslint-disable no-underscore-dangle */
    _xlsx2.default.SSF._table[161] = '0.0';
    _xlsx2.default.SSF._table[162] = '0.000';
    _xlsx2.default.SSF._table[163] = '0.0000';
    _xlsx2.default.SSF._table[164] = '0.00000';
    _xlsx2.default.SSF._table[165] = '0.000000';
    var sheet = {};
    var sheetColumns = [];
    var cellRef = {};
    var range = { s: { c: 0, r: 0 }, e: { c: columns.length - 1, r: data.size } };
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
          cellData = (0, _excel.convertValueType)(cellData, col.valueTypeExcel);
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

  this.exportToExcel = function (data, columns) {
    var fileName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Export From OC';
    var digits = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var visibleColumns = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    var sheetName = 'Sheet1';
    var exportedColumns = (0, _excel.getColumns)(columns, visibleColumns);
    var sheet = _this.createWorksheet(data, exportedColumns, digits);
    var book = { SheetNames: [sheetName], Sheets: {} };
    book.Sheets[sheetName] = sheet;
    _xlsx2.default.writeFile(book, fileName + '.xlsx', { bookType: 'xlsx', bookSST: true, type: 'binary' });
  };

  this.importFromExcel = function (files, callback) {
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

  this.onLoadCallback = function (e, columns) {
    var visibleColumns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var result = (0, _excel.convertArrayBufferToString)(e.target.result);
    var book = _xlsx2.default.read(btoa(result), { type: 'base64' });
    var rawData = _xlsx2.default.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, raw: true });
    if (Array.isArray(rawData) && rawData.length < 2) {
      return [];
    }
    var importedColumns = (0, _excel.getColumns)(columns, visibleColumns);
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
}

/**
  * Export data to Excel
  * Input:
  * data is a List of data to export,
  * columns is an array of column objects with the keys:
  * {
  *  header :: string or element, defines the column name,
  *  valueKeyPath :: array of strings, defines the column id,
  *  width :: number, width in pixels,
  *  disableValueRenderInExcel :: bool (optional), disable valueRender callback for export
  *   to Excel, instead export value directly,
  *  headerText :: string (optional), needed if 'header' is not a text,
  *  valueRender :: function (optional), defines a render function,
  *  valueTypeExcel :: string (optional), defines a value type for Excel if differs from UI
  * },
  * fileName is a file name string (optional),
  * digits is a number of digits for decimals in all table or an array containing digits
  *   for cells (optional),
  * visibleColumns is a list of visible columns in case column settings is used (optional).
  */


/**
 * Import data from Excel
 * Input:
 * files is an event.target.files array,
 * callback is onLoad callback called from a parent component,
 * alertCallback is a callback for error alert (optional).
 */


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
 * visibleColumns is a list of visible columns in case column settings is used (optional).
 * Output:
 * an array of data.
 */
;

exports.default = new Excel();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leGNlbC5qcyJdLCJuYW1lcyI6WyJFeGNlbCIsImNyZWF0ZVdvcmtzaGVldCIsImRhdGEiLCJjb2x1bW5zIiwiZGlnaXRzIiwiU1NGIiwiX3RhYmxlIiwic2hlZXQiLCJzaGVldENvbHVtbnMiLCJjZWxsUmVmIiwicmFuZ2UiLCJzIiwiYyIsInIiLCJlIiwibGVuZ3RoIiwic2l6ZSIsImZvckVhY2giLCJjb2wiLCJjb2xJbmRleCIsInV0aWxzIiwiZW5jb2RlX2NlbGwiLCJoZWFkZXIiLCJoZWFkZXJUZXh0IiwiU3RyaW5nIiwidCIsInYiLCJwdXNoIiwid3B4Iiwid2lkdGgiLCJyb3ciLCJyb3dJbmRleCIsImNlbGxEYXRhIiwidmFsdWVLZXlQYXRoIiwiZ2V0SW4iLCJ2YWx1ZVJlbmRlciIsInVuZGVmaW5lZCIsImRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwiLCJ2YWx1ZVR5cGVFeGNlbCIsImNlbGwiLCJBcnJheSIsImlzQXJyYXkiLCJOdW1iZXIiLCJqb2luIiwieiIsInRvRml4ZWQiLCJlbmNvZGVfcmFuZ2UiLCJleHBvcnRUb0V4Y2VsIiwiZmlsZU5hbWUiLCJ2aXNpYmxlQ29sdW1ucyIsInNoZWV0TmFtZSIsImV4cG9ydGVkQ29sdW1ucyIsImJvb2siLCJTaGVldE5hbWVzIiwiU2hlZXRzIiwid3JpdGVGaWxlIiwiYm9va1R5cGUiLCJib29rU1NUIiwidHlwZSIsImltcG9ydEZyb21FeGNlbCIsImZpbGVzIiwiY2FsbGJhY2siLCJhbGVydENhbGxiYWNrIiwicmVhZGVyIiwiRmlsZVJlYWRlciIsIm9ubG9hZCIsInJlYWRBc0FycmF5QnVmZmVyIiwib25Mb2FkQ2FsbGJhY2siLCJyZXN1bHQiLCJ0YXJnZXQiLCJyZWFkIiwiYnRvYSIsInJhd0RhdGEiLCJzaGVldF90b19qc29uIiwicmF3IiwiaW1wb3J0ZWRDb2x1bW5zIiwiaXRlbSIsImNlbGxJbmRleCIsInZhbHVlIiwidmFsdWVFeGNlbE1hdGNoIiwiY29sdW1uIiwiZGVm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OztBQW9CQTs7Ozs7Ozs7Ozs7Ozs7OztrQkErQ2EsSUFBSUYsS0FBSixFIiwiZmlsZSI6ImV4Y2VsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhMU1ggZnJvbSAneGxzeCc7XG5cbmltcG9ydCB7XG4gIGdldENvbHVtbnMsXG4gIGNvbnZlcnRBcnJheUJ1ZmZlclRvU3RyaW5nLFxuICBjb252ZXJ0VmFsdWVUeXBlLFxufSBmcm9tICcuL2V4Y2VsLnV0aWxzJztcblxuY2xhc3MgRXhjZWwge1xuICBjcmVhdGVXb3Jrc2hlZXQgPSAoZGF0YSwgY29sdW1ucywgZGlnaXRzKSA9PiB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZXJzY29yZS1kYW5nbGUgKi9cbiAgICBYTFNYLlNTRi5fdGFibGVbMTYxXSA9ICcwLjAnO1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjJdID0gJzAuMDAwJztcbiAgICBYTFNYLlNTRi5fdGFibGVbMTYzXSA9ICcwLjAwMDAnO1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjRdID0gJzAuMDAwMDAnO1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjVdID0gJzAuMDAwMDAwJztcbiAgICBjb25zdCBzaGVldCA9IHt9O1xuICAgIGNvbnN0IHNoZWV0Q29sdW1ucyA9IFtdO1xuICAgIGxldCBjZWxsUmVmID0ge307XG4gICAgY29uc3QgcmFuZ2UgPSB7IHM6IHsgYzogMCwgcjogMCB9LCBlOiB7IGM6IGNvbHVtbnMubGVuZ3RoIC0gMSwgcjogZGF0YS5zaXplIH0gfTtcbiAgICBjb2x1bW5zLmZvckVhY2goKGNvbCwgY29sSW5kZXgpID0+IHtcbiAgICAgIGNlbGxSZWYgPSBYTFNYLnV0aWxzLmVuY29kZV9jZWxsKHsgYzogY29sSW5kZXgsIHI6IDAgfSk7XG4gICAgICBjb25zdCBoZWFkZXIgPSBjb2wuaGVhZGVyVGV4dCA/IFN0cmluZyhjb2wuaGVhZGVyVGV4dCkgOiBTdHJpbmcoY29sLmhlYWRlcik7XG4gICAgICBzaGVldFtjZWxsUmVmXSA9IHsgdDogJ3MnLCB2OiBoZWFkZXIgfTtcbiAgICAgIHNoZWV0Q29sdW1ucy5wdXNoKHsgd3B4OiBjb2wud2lkdGggfSk7XG4gICAgfSk7XG4gICAgZGF0YS5mb3JFYWNoKChyb3csIHJvd0luZGV4KSA9PiB7XG4gICAgICBjb2x1bW5zLmZvckVhY2goKGNvbCwgY29sSW5kZXgpID0+IHtcbiAgICAgICAgbGV0IGNlbGxEYXRhID0gY29sLnZhbHVlS2V5UGF0aCA/IHJvdy5nZXRJbihjb2wudmFsdWVLZXlQYXRoKSA6ICcnO1xuICAgICAgICBpZiAoY29sLnZhbHVlUmVuZGVyICE9PSB1bmRlZmluZWQgJiYgIWNvbC5kaXNhYmxlVmFsdWVSZW5kZXJJbkV4Y2VsKSB7XG4gICAgICAgICAgY2VsbERhdGEgPSBTdHJpbmcoY29sLnZhbHVlUmVuZGVyKHJvdykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wudmFsdWVUeXBlRXhjZWwpIHtcbiAgICAgICAgICBjZWxsRGF0YSA9IGNvbnZlcnRWYWx1ZVR5cGUoY2VsbERhdGEsIGNvbC52YWx1ZVR5cGVFeGNlbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNlbGxEYXRhID09PSBudWxsIHx8IGNlbGxEYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjZWxsRGF0YSA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNlbGwgPSB7IHY6IGNlbGxEYXRhIH07XG4gICAgICAgIGNlbGxSZWYgPSBYTFNYLnV0aWxzLmVuY29kZV9jZWxsKHsgYzogY29sSW5kZXgsIHI6IHJvd0luZGV4ICsgMSB9KTtcbiAgICAgICAgaWYgKHR5cGVvZiBjZWxsLnYgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgY2VsbC50ID0gJ24nO1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRpZ2l0cykgJiYgTnVtYmVyKGRpZ2l0c1tyb3dJbmRleF1bY29sLnZhbHVlS2V5UGF0aC5qb2luKCcvJyldKSA+IC0xKSB7XG4gICAgICAgICAgICBjZWxsLnogPSBOdW1iZXIoWExTWC5TU0YuX3RhYmxlWzJdKS50b0ZpeGVkKGRpZ2l0c1tyb3dJbmRleF1bY29sLnZhbHVlS2V5UGF0aC5qb2luKCcvJyldKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihkaWdpdHMpID4gLTEpIHtcbiAgICAgICAgICAgIGNlbGwueiA9IE51bWJlcihYTFNYLlNTRi5fdGFibGVbMl0pLnRvRml4ZWQoZGlnaXRzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGwudiA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgY2VsbC50ID0gJ2InO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNlbGwudCA9ICdzJztcbiAgICAgICAgfVxuICAgICAgICBzaGVldFtjZWxsUmVmXSA9IGNlbGw7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBzaGVldFsnIWNvbHMnXSA9IHNoZWV0Q29sdW1ucztcbiAgICBzaGVldFsnIXJlZiddID0gWExTWC51dGlscy5lbmNvZGVfcmFuZ2UocmFuZ2UpO1xuICAgIHJldHVybiBzaGVldDtcbiAgfTtcblxuICAvKipcbiAgICAqIEV4cG9ydCBkYXRhIHRvIEV4Y2VsXG4gICAgKiBJbnB1dDpcbiAgICAqIGRhdGEgaXMgYSBMaXN0IG9mIGRhdGEgdG8gZXhwb3J0LFxuICAgICogY29sdW1ucyBpcyBhbiBhcnJheSBvZiBjb2x1bW4gb2JqZWN0cyB3aXRoIHRoZSBrZXlzOlxuICAgICoge1xuICAgICogIGhlYWRlciA6OiBzdHJpbmcgb3IgZWxlbWVudCwgZGVmaW5lcyB0aGUgY29sdW1uIG5hbWUsXG4gICAgKiAgdmFsdWVLZXlQYXRoIDo6IGFycmF5IG9mIHN0cmluZ3MsIGRlZmluZXMgdGhlIGNvbHVtbiBpZCxcbiAgICAqICB3aWR0aCA6OiBudW1iZXIsIHdpZHRoIGluIHBpeGVscyxcbiAgICAqICBkaXNhYmxlVmFsdWVSZW5kZXJJbkV4Y2VsIDo6IGJvb2wgKG9wdGlvbmFsKSwgZGlzYWJsZSB2YWx1ZVJlbmRlciBjYWxsYmFjayBmb3IgZXhwb3J0XG4gICAgKiAgIHRvIEV4Y2VsLCBpbnN0ZWFkIGV4cG9ydCB2YWx1ZSBkaXJlY3RseSxcbiAgICAqICBoZWFkZXJUZXh0IDo6IHN0cmluZyAob3B0aW9uYWwpLCBuZWVkZWQgaWYgJ2hlYWRlcicgaXMgbm90IGEgdGV4dCxcbiAgICAqICB2YWx1ZVJlbmRlciA6OiBmdW5jdGlvbiAob3B0aW9uYWwpLCBkZWZpbmVzIGEgcmVuZGVyIGZ1bmN0aW9uLFxuICAgICogIHZhbHVlVHlwZUV4Y2VsIDo6IHN0cmluZyAob3B0aW9uYWwpLCBkZWZpbmVzIGEgdmFsdWUgdHlwZSBmb3IgRXhjZWwgaWYgZGlmZmVycyBmcm9tIFVJXG4gICAgKiB9LFxuICAgICogZmlsZU5hbWUgaXMgYSBmaWxlIG5hbWUgc3RyaW5nIChvcHRpb25hbCksXG4gICAgKiBkaWdpdHMgaXMgYSBudW1iZXIgb2YgZGlnaXRzIGZvciBkZWNpbWFscyBpbiBhbGwgdGFibGUgb3IgYW4gYXJyYXkgY29udGFpbmluZyBkaWdpdHNcbiAgICAqICAgZm9yIGNlbGxzIChvcHRpb25hbCksXG4gICAgKiB2aXNpYmxlQ29sdW1ucyBpcyBhIGxpc3Qgb2YgdmlzaWJsZSBjb2x1bW5zIGluIGNhc2UgY29sdW1uIHNldHRpbmdzIGlzIHVzZWQgKG9wdGlvbmFsKS5cbiAgICAqL1xuICBleHBvcnRUb0V4Y2VsID0gKGRhdGEsIGNvbHVtbnMsIGZpbGVOYW1lID0gJ0V4cG9ydCBGcm9tIE9DJywgZGlnaXRzID0gbnVsbCwgdmlzaWJsZUNvbHVtbnMgPSBudWxsKSA9PiB7XG4gICAgY29uc3Qgc2hlZXROYW1lID0gJ1NoZWV0MSc7XG4gICAgY29uc3QgZXhwb3J0ZWRDb2x1bW5zID0gZ2V0Q29sdW1ucyhjb2x1bW5zLCB2aXNpYmxlQ29sdW1ucyk7XG4gICAgY29uc3Qgc2hlZXQgPSB0aGlzLmNyZWF0ZVdvcmtzaGVldChkYXRhLCBleHBvcnRlZENvbHVtbnMsIGRpZ2l0cyk7XG4gICAgY29uc3QgYm9vayA9IHsgU2hlZXROYW1lczogW3NoZWV0TmFtZV0sIFNoZWV0czoge30gfTtcbiAgICBib29rLlNoZWV0c1tzaGVldE5hbWVdID0gc2hlZXQ7XG4gICAgWExTWC53cml0ZUZpbGUoYm9vaywgYCR7ZmlsZU5hbWV9Lnhsc3hgLCB7IGJvb2tUeXBlOiAneGxzeCcsIGJvb2tTU1Q6IHRydWUsIHR5cGU6ICdiaW5hcnknIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbXBvcnQgZGF0YSBmcm9tIEV4Y2VsXG4gICAqIElucHV0OlxuICAgKiBmaWxlcyBpcyBhbiBldmVudC50YXJnZXQuZmlsZXMgYXJyYXksXG4gICAqIGNhbGxiYWNrIGlzIG9uTG9hZCBjYWxsYmFjayBjYWxsZWQgZnJvbSBhIHBhcmVudCBjb21wb25lbnQsXG4gICAqIGFsZXJ0Q2FsbGJhY2sgaXMgYSBjYWxsYmFjayBmb3IgZXJyb3IgYWxlcnQgKG9wdGlvbmFsKS5cbiAgICovXG4gIGltcG9ydEZyb21FeGNlbCA9IChmaWxlcywgY2FsbGJhY2ssIGFsZXJ0Q2FsbGJhY2sgPSBudWxsKSA9PiB7XG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoYWxlcnRDYWxsYmFjayAmJiBmaWxlc1swXS50eXBlICE9PSAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXQnKSB7XG4gICAgICBhbGVydENhbGxiYWNrKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgcmVhZGVyLm9ubG9hZCA9IGNhbGxiYWNrO1xuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihmaWxlc1swXSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIG9uIGxvYWQgb2YgRmlsZVJlYWRlciBmb3IgaW1wb3J0IG9wZXJhdGlvblxuICAgKiBJbnB1dDpcbiAgICogZSBpcyBhbiBldmVudCBvYmplY3QsXG4gICAqIGNvbHVtbnMgaXMgYW4gYXJyYXkgb2YgY29sdW1uIG9iamVjdHMgd2l0aCB0aGUga2V5czpcbiAgICoge1xuICAgKiAgdmFsdWVLZXlQYXRoIDo6IGFycmF5IG9mIHN0cmluZ3MsXG4gICAqICB2YWx1ZUV4Y2VsTWF0Y2ggOjogZnVuY3Rpb24gKG9wdGlvbmFsKSxcbiAgICogIGRlZmF1bHRWYWx1ZSA6OiBhbnksXG4gICAqIH0sXG4gICAqIHZpc2libGVDb2x1bW5zIGlzIGEgbGlzdCBvZiB2aXNpYmxlIGNvbHVtbnMgaW4gY2FzZSBjb2x1bW4gc2V0dGluZ3MgaXMgdXNlZCAob3B0aW9uYWwpLlxuICAgKiBPdXRwdXQ6XG4gICAqIGFuIGFycmF5IG9mIGRhdGEuXG4gICAqL1xuICBvbkxvYWRDYWxsYmFjayA9IChlLCBjb2x1bW5zLCB2aXNpYmxlQ29sdW1ucyA9IG51bGwpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBjb252ZXJ0QXJyYXlCdWZmZXJUb1N0cmluZyhlLnRhcmdldC5yZXN1bHQpO1xuICAgIGNvbnN0IGJvb2sgPSBYTFNYLnJlYWQoYnRvYShyZXN1bHQpLCB7IHR5cGU6ICdiYXNlNjQnIH0pO1xuICAgIGNvbnN0IHJhd0RhdGEgPVxuICAgICAgWExTWC51dGlscy5zaGVldF90b19qc29uKGJvb2suU2hlZXRzW2Jvb2suU2hlZXROYW1lc1swXV0sIHsgaGVhZGVyOiAxLCByYXc6IHRydWUgfSk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmF3RGF0YSkgJiYgcmF3RGF0YS5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGltcG9ydGVkQ29sdW1ucyA9IGdldENvbHVtbnMoY29sdW1ucywgdmlzaWJsZUNvbHVtbnMpO1xuICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICByYXdEYXRhLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICAgIC8vIHNraXAgdGhlIGhlYWRlclxuICAgICAgaWYgKHJvd0luZGV4ID49IDEpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHt9O1xuICAgICAgICByb3cuZm9yRWFjaCgoY2VsbCwgY2VsbEluZGV4KSA9PiB7XG4gICAgICAgICAgaWYgKGNlbGxJbmRleCA8IGltcG9ydGVkQ29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gaW1wb3J0ZWRDb2x1bW5zW2NlbGxJbmRleF0udmFsdWVFeGNlbE1hdGNoICE9PSB1bmRlZmluZWQgP1xuICAgICAgICAgICAgICBpbXBvcnRlZENvbHVtbnNbY2VsbEluZGV4XS52YWx1ZUV4Y2VsTWF0Y2goY2VsbCkgOiBjZWxsO1xuICAgICAgICAgICAgaXRlbVtpbXBvcnRlZENvbHVtbnNbY2VsbEluZGV4XS52YWx1ZUtleVBhdGhbMF1dID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaW1wb3J0ZWRDb2x1bW5zLmZvckVhY2goKGNvbHVtbikgPT4ge1xuICAgICAgICAgIGlmIChjb2x1bW4uZGVmYXVsdFZhbHVlICE9PSB1bmRlZmluZWQgJiYgaXRlbVtjb2x1bW4udmFsdWVLZXlQYXRoWzBdXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpdGVtW2NvbHVtbi52YWx1ZUtleVBhdGhbMF1dID0gY29sdW1uLmRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkYXRhLnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEV4Y2VsKCk7XG4iXX0=