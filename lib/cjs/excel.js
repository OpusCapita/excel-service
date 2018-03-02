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
    if (files.length === 0) {
      return;
    }
    if (files[0].type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
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
  * data :: list, defines data to export,
  * columns :: array, defines an array of column objects with the keys:
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
  * fileName :: string (optional), defines a file name,
  * digits :: [number, array] (optional), defines a number of digits for decimals in all table
  *   or an array containing digits for cells,
  * visibleColumns :: list (optional), defines visible columns in case column settings are used.
  */


/**
 * Import data from Excel
 * Input:
 * files :: event.target.files array,
 * callback :: function, onLoad callback.
 */


/**
 * Callback on load of FileReader for import operation
 * Input:
 * e :: event object,
 * columns :: array, defines column objects with the keys:
 * {
 *  valueKeyPath :: array of strings, defines the column id,
 *  valueExcelMatch :: function (optional), callback to update the value in imported data,
 *  defaultValue :: any (optional), defines a default value
 * },
 * visibleColumns :: list (optional), defines visible columns in case column settings is used.
 * Output:
 * array of imported data.
 */
;

exports.default = new Excel();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leGNlbC5qcyJdLCJuYW1lcyI6WyJFeGNlbCIsImNyZWF0ZVdvcmtzaGVldCIsImRhdGEiLCJjb2x1bW5zIiwiZGlnaXRzIiwiU1NGIiwiX3RhYmxlIiwic2hlZXQiLCJzaGVldENvbHVtbnMiLCJjZWxsUmVmIiwicmFuZ2UiLCJzIiwiYyIsInIiLCJlIiwibGVuZ3RoIiwic2l6ZSIsImZvckVhY2giLCJjb2wiLCJjb2xJbmRleCIsInV0aWxzIiwiZW5jb2RlX2NlbGwiLCJoZWFkZXIiLCJoZWFkZXJUZXh0IiwiU3RyaW5nIiwidCIsInYiLCJwdXNoIiwid3B4Iiwid2lkdGgiLCJyb3ciLCJyb3dJbmRleCIsImNlbGxEYXRhIiwidmFsdWVLZXlQYXRoIiwiZ2V0SW4iLCJ2YWx1ZVJlbmRlciIsInVuZGVmaW5lZCIsImRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwiLCJ2YWx1ZVR5cGVFeGNlbCIsImNlbGwiLCJBcnJheSIsImlzQXJyYXkiLCJOdW1iZXIiLCJqb2luIiwieiIsInRvRml4ZWQiLCJlbmNvZGVfcmFuZ2UiLCJleHBvcnRUb0V4Y2VsIiwiZmlsZU5hbWUiLCJ2aXNpYmxlQ29sdW1ucyIsInNoZWV0TmFtZSIsImV4cG9ydGVkQ29sdW1ucyIsImJvb2siLCJTaGVldE5hbWVzIiwiU2hlZXRzIiwid3JpdGVGaWxlIiwiYm9va1R5cGUiLCJib29rU1NUIiwidHlwZSIsImltcG9ydEZyb21FeGNlbCIsImZpbGVzIiwiY2FsbGJhY2siLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwicmVhZEFzQXJyYXlCdWZmZXIiLCJvbkxvYWRDYWxsYmFjayIsInJlc3VsdCIsInRhcmdldCIsInJlYWQiLCJidG9hIiwicmF3RGF0YSIsInNoZWV0X3RvX2pzb24iLCJyYXciLCJpbXBvcnRlZENvbHVtbnMiLCJpdGVtIiwiY2VsbEluZGV4IiwidmFsdWUiLCJ2YWx1ZUV4Y2VsTWF0Y2giLCJjb2x1bW4iLCJkZWZhdWx0VmFsdWUiXSwibWFw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InNvdXJjZXNDb250ZW50IjpbImltcG9ydCBYTFNYIGZyb20gJ3hsc3gnO1xuXG5pbXBvcnQgeyBnZXRDb2x1bW5zLCBjb252ZXJ0QXJyYXlCdWZmZXJUb1N0cmluZywgY29udmVydFZhbHVlVHlwZSB9IGZyb20gJy4vZXhjZWwudXRpbHMnO1xuXG5jbGFzcyBFeGNlbCB7XG4gIGNyZWF0ZVdvcmtzaGVldCA9IChkYXRhLCBjb2x1bW5zLCBkaWdpdHMpID0+IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlcnNjb3JlLWRhbmdsZSAqL1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjFdID0gJzAuMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2Ml0gPSAnMC4wMDAnO1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjNdID0gJzAuMDAwMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2NF0gPSAnMC4wMDAwMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2NV0gPSAnMC4wMDAwMDAnO1xuICAgIGNvbnN0IHNoZWV0ID0ge307XG4gICAgY29uc3Qgc2hlZXRDb2x1bW5zID0gW107XG4gICAgbGV0IGNlbGxSZWYgPSB7fTtcbiAgICBjb25zdCByYW5nZSA9IHsgczogeyBjOiAwLCByOiAwIH0sIGU6IHsgYzogY29sdW1ucy5sZW5ndGggLSAxLCByOiBkYXRhLnNpemUgfSB9O1xuICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBjb2xJbmRleCkgPT4ge1xuICAgICAgY2VsbFJlZiA9IFhMU1gudXRpbHMuZW5jb2RlX2NlbGwoeyBjOiBjb2xJbmRleCwgcjogMCB9KTtcbiAgICAgIGNvbnN0IGhlYWRlciA9IGNvbC5oZWFkZXJUZXh0ID8gU3RyaW5nKGNvbC5oZWFkZXJUZXh0KSA6IFN0cmluZyhjb2wuaGVhZGVyKTtcbiAgICAgIHNoZWV0W2NlbGxSZWZdID0geyB0OiAncycsIHY6IGhlYWRlciB9O1xuICAgICAgc2hlZXRDb2x1bW5zLnB1c2goeyB3cHg6IGNvbC53aWR0aCB9KTtcbiAgICB9KTtcbiAgICBkYXRhLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBjb2xJbmRleCkgPT4ge1xuICAgICAgICBsZXQgY2VsbERhdGEgPSBjb2wudmFsdWVLZXlQYXRoID8gcm93LmdldEluKGNvbC52YWx1ZUtleVBhdGgpIDogJyc7XG4gICAgICAgIGlmIChjb2wudmFsdWVSZW5kZXIgIT09IHVuZGVmaW5lZCAmJiAhY29sLmRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwpIHtcbiAgICAgICAgICBjZWxsRGF0YSA9IFN0cmluZyhjb2wudmFsdWVSZW5kZXIocm93KSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbC52YWx1ZVR5cGVFeGNlbCkge1xuICAgICAgICAgIGNlbGxEYXRhID0gY29udmVydFZhbHVlVHlwZShjZWxsRGF0YSwgY29sLnZhbHVlVHlwZUV4Y2VsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2VsbERhdGEgPT09IG51bGwgfHwgY2VsbERhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNlbGxEYXRhID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2VsbCA9IHsgdjogY2VsbERhdGEgfTtcbiAgICAgICAgY2VsbFJlZiA9IFhMU1gudXRpbHMuZW5jb2RlX2NlbGwoeyBjOiBjb2xJbmRleCwgcjogcm93SW5kZXggKyAxIH0pO1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwudiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBjZWxsLnQgPSAnbic7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGlnaXRzKSAmJiBOdW1iZXIoZGlnaXRzW3Jvd0luZGV4XVtjb2wudmFsdWVLZXlQYXRoLmpvaW4oJy8nKV0pID4gLTEpIHtcbiAgICAgICAgICAgIGNlbGwueiA9IE51bWJlcihYTFNYLlNTRi5fdGFibGVbMl0pLnRvRml4ZWQoZGlnaXRzW3Jvd0luZGV4XVtjb2wudmFsdWVLZXlQYXRoLmpvaW4oJy8nKV0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGRpZ2l0cykgPiAtMSkge1xuICAgICAgICAgICAgY2VsbC56ID0gTnVtYmVyKFhMU1guU1NGLl90YWJsZVsyXSkudG9GaXhlZChkaWdpdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbC52ID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBjZWxsLnQgPSAnYic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2VsbC50ID0gJ3MnO1xuICAgICAgICB9XG4gICAgICAgIHNoZWV0W2NlbGxSZWZdID0gY2VsbDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHNoZWV0WychY29scyddID0gc2hlZXRDb2x1bW5zO1xuICAgIHNoZWV0WychcmVmJ10gPSBYTFNYLnV0aWxzLmVuY29kZV9yYW5nZShyYW5nZSk7XG4gICAgcmV0dXJuIHNoZWV0O1xuICB9O1xuXG4gIC8qKlxuICAgICogRXhwb3J0IGRhdGEgdG8gRXhjZWxcbiAgICAqIElucHV0OlxuICAgICogZGF0YSA6OiBsaXN0LCBkZWZpbmVzIGRhdGEgdG8gZXhwb3J0LFxuICAgICogY29sdW1ucyA6OiBhcnJheSwgZGVmaW5lcyBhbiBhcnJheSBvZiBjb2x1bW4gb2JqZWN0cyB3aXRoIHRoZSBrZXlzOlxuICAgICoge1xuICAgICogIGhlYWRlciA6OiBzdHJpbmcgb3IgZWxlbWVudCwgZGVmaW5lcyB0aGUgY29sdW1uIG5hbWUsXG4gICAgKiAgdmFsdWVLZXlQYXRoIDo6IGFycmF5IG9mIHN0cmluZ3MsIGRlZmluZXMgdGhlIGNvbHVtbiBpZCxcbiAgICAqICB3aWR0aCA6OiBudW1iZXIsIHdpZHRoIGluIHBpeGVscyxcbiAgICAqICBkaXNhYmxlVmFsdWVSZW5kZXJJbkV4Y2VsIDo6IGJvb2wgKG9wdGlvbmFsKSwgZGlzYWJsZSB2YWx1ZVJlbmRlciBjYWxsYmFjayBmb3IgZXhwb3J0XG4gICAgKiAgIHRvIEV4Y2VsLCBpbnN0ZWFkIGV4cG9ydCB2YWx1ZSBkaXJlY3RseSxcbiAgICAqICBoZWFkZXJUZXh0IDo6IHN0cmluZyAob3B0aW9uYWwpLCBuZWVkZWQgaWYgJ2hlYWRlcicgaXMgbm90IGEgdGV4dCxcbiAgICAqICB2YWx1ZVJlbmRlciA6OiBmdW5jdGlvbiAob3B0aW9uYWwpLCBkZWZpbmVzIGEgcmVuZGVyIGZ1bmN0aW9uLFxuICAgICogIHZhbHVlVHlwZUV4Y2VsIDo6IHN0cmluZyAob3B0aW9uYWwpLCBkZWZpbmVzIGEgdmFsdWUgdHlwZSBmb3IgRXhjZWwgaWYgZGlmZmVycyBmcm9tIFVJXG4gICAgKiB9LFxuICAgICogZmlsZU5hbWUgOjogc3RyaW5nIChvcHRpb25hbCksIGRlZmluZXMgYSBmaWxlIG5hbWUsXG4gICAgKiBkaWdpdHMgOjogW251bWJlciwgYXJyYXldIChvcHRpb25hbCksIGRlZmluZXMgYSBudW1iZXIgb2YgZGlnaXRzIGZvciBkZWNpbWFscyBpbiBhbGwgdGFibGVcbiAgICAqICAgb3IgYW4gYXJyYXkgY29udGFpbmluZyBkaWdpdHMgZm9yIGNlbGxzLFxuICAgICogdmlzaWJsZUNvbHVtbnMgOjogbGlzdCAob3B0aW9uYWwpLCBkZWZpbmVzIHZpc2libGUgY29sdW1ucyBpbiBjYXNlIGNvbHVtbiBzZXR0aW5ncyBhcmUgdXNlZC5cbiAgICAqL1xuICBleHBvcnRUb0V4Y2VsID0gKGRhdGEsIGNvbHVtbnMsIGZpbGVOYW1lID0gJ0V4cG9ydCBGcm9tIE9DJywgZGlnaXRzID0gbnVsbCwgdmlzaWJsZUNvbHVtbnMgPSBudWxsKSA9PiB7XG4gICAgY29uc3Qgc2hlZXROYW1lID0gJ1NoZWV0MSc7XG4gICAgY29uc3QgZXhwb3J0ZWRDb2x1bW5zID0gZ2V0Q29sdW1ucyhjb2x1bW5zLCB2aXNpYmxlQ29sdW1ucyk7XG4gICAgY29uc3Qgc2hlZXQgPSB0aGlzLmNyZWF0ZVdvcmtzaGVldChkYXRhLCBleHBvcnRlZENvbHVtbnMsIGRpZ2l0cyk7XG4gICAgY29uc3QgYm9vayA9IHsgU2hlZXROYW1lczogW3NoZWV0TmFtZV0sIFNoZWV0czoge30gfTtcbiAgICBib29rLlNoZWV0c1tzaGVldE5hbWVdID0gc2hlZXQ7XG4gICAgWExTWC53cml0ZUZpbGUoYm9vaywgYCR7ZmlsZU5hbWV9Lnhsc3hgLCB7IGJvb2tUeXBlOiAneGxzeCcsIGJvb2tTU1Q6IHRydWUsIHR5cGU6ICdiaW5hcnknIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbXBvcnQgZGF0YSBmcm9tIEV4Y2VsXG4gICAqIElucHV0OlxuICAgKiBmaWxlcyA6OiBldmVudC50YXJnZXQuZmlsZXMgYXJyYXksXG4gICAqIGNhbGxiYWNrIDo6IGZ1bmN0aW9uLCBvbkxvYWQgY2FsbGJhY2suXG4gICAqL1xuICBpbXBvcnRGcm9tRXhjZWwgPSAoZmlsZXMsIGNhbGxiYWNrKSA9PiB7XG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZmlsZXNbMF0udHlwZSAhPT0gJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIHJlYWRlci5vbmxvYWQgPSBjYWxsYmFjaztcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoZmlsZXNbMF0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBvbiBsb2FkIG9mIEZpbGVSZWFkZXIgZm9yIGltcG9ydCBvcGVyYXRpb25cbiAgICogSW5wdXQ6XG4gICAqIGUgOjogZXZlbnQgb2JqZWN0LFxuICAgKiBjb2x1bW5zIDo6IGFycmF5LCBkZWZpbmVzIGNvbHVtbiBvYmplY3RzIHdpdGggdGhlIGtleXM6XG4gICAqIHtcbiAgICogIHZhbHVlS2V5UGF0aCA6OiBhcnJheSBvZiBzdHJpbmdzLCBkZWZpbmVzIHRoZSBjb2x1bW4gaWQsXG4gICAqICB2YWx1ZUV4Y2VsTWF0Y2ggOjogZnVuY3Rpb24gKG9wdGlvbmFsKSwgY2FsbGJhY2sgdG8gdXBkYXRlIHRoZSB2YWx1ZSBpbiBpbXBvcnRlZCBkYXRhLFxuICAgKiAgZGVmYXVsdFZhbHVlIDo6IGFueSAob3B0aW9uYWwpLCBkZWZpbmVzIGEgZGVmYXVsdCB2YWx1ZVxuICAgKiB9LFxuICAgKiB2aXNpYmxlQ29sdW1ucyA6OiBsaXN0IChvcHRpb25hbCksIGRlZmluZXMgdmlzaWJsZSBjb2x1bW5zIGluIGNhc2UgY29sdW1uIHNldHRpbmdzIGlzIHVzZWQuXG4gICAqIE91dHB1dDpcbiAgICogYXJyYXkgb2YgaW1wb3J0ZWQgZGF0YS5cbiAgICovXG4gIG9uTG9hZENhbGxiYWNrID0gKGUsIGNvbHVtbnMsIHZpc2libGVDb2x1bW5zID0gbnVsbCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGNvbnZlcnRBcnJheUJ1ZmZlclRvU3RyaW5nKGUudGFyZ2V0LnJlc3VsdCk7XG4gICAgY29uc3QgYm9vayA9IFhMU1gucmVhZChidG9hKHJlc3VsdCksIHsgdHlwZTogJ2Jhc2U2NCcgfSk7XG4gICAgY29uc3QgcmF3RGF0YSA9XG4gICAgICBYTFNYLnV0aWxzLnNoZWV0X3RvX2pzb24oYm9vay5TaGVldHNbYm9vay5TaGVldE5hbWVzWzBdXSwgeyBoZWFkZXI6IDEsIHJhdzogdHJ1ZSB9KTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyYXdEYXRhKSAmJiByYXdEYXRhLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgaW1wb3J0ZWRDb2x1bW5zID0gZ2V0Q29sdW1ucyhjb2x1bW5zLCB2aXNpYmxlQ29sdW1ucyk7XG4gICAgY29uc3QgZGF0YSA9IFtdO1xuICAgIHJhd0RhdGEuZm9yRWFjaCgocm93LCByb3dJbmRleCkgPT4ge1xuICAgICAgLy8gc2tpcCB0aGUgaGVhZGVyXG4gICAgICBpZiAocm93SW5kZXggPj0gMSkge1xuICAgICAgICBjb25zdCBpdGVtID0ge307XG4gICAgICAgIHJvdy5mb3JFYWNoKChjZWxsLCBjZWxsSW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAoY2VsbEluZGV4IDwgaW1wb3J0ZWRDb2x1bW5zLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBpbXBvcnRlZENvbHVtbnNbY2VsbEluZGV4XS52YWx1ZUV4Y2VsTWF0Y2ggIT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgICAgIGltcG9ydGVkQ29sdW1uc1tjZWxsSW5kZXhdLnZhbHVlRXhjZWxNYXRjaChjZWxsKSA6IGNlbGw7XG4gICAgICAgICAgICBpdGVtW2ltcG9ydGVkQ29sdW1uc1tjZWxsSW5kZXhdLnZhbHVlS2V5UGF0aFswXV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpbXBvcnRlZENvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG4gICAgICAgICAgaWYgKGNvbHVtbi5kZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCAmJiBpdGVtW2NvbHVtbi52YWx1ZUtleVBhdGhbMF1dID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGl0ZW1bY29sdW1uLnZhbHVlS2V5UGF0aFswXV0gPSBjb2x1bW4uZGVmYXVsdFZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRhdGEucHVzaChpdGVtKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgRXhjZWwoKTtcbiJdfQ==