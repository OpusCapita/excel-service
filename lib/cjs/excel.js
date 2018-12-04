'use strict';

exports.__esModule = true;

var _xlsx = require('xlsx');

var _xlsx2 = _interopRequireDefault(_xlsx);

var _excel = require('./excel.utils');

var _styledExcelExport = require('./styled-excel-export');

var _styledExcelExport2 = _interopRequireDefault(_styledExcelExport);

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

  this.exportSheetsToExcel = function (sheets, fileName) {
    (0, _styledExcelExport2.default)(sheets, fileName);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leGNlbC5qcyJdLCJuYW1lcyI6WyJFeGNlbCIsImNyZWF0ZVdvcmtzaGVldCIsImRhdGEiLCJjb2x1bW5zIiwiZGlnaXRzIiwiWExTWCIsIlNTRiIsIl90YWJsZSIsInNoZWV0Iiwic2hlZXRDb2x1bW5zIiwiY2VsbFJlZiIsInJhbmdlIiwicyIsImMiLCJyIiwiZSIsImxlbmd0aCIsInNpemUiLCJmb3JFYWNoIiwiY29sIiwiY29sSW5kZXgiLCJ1dGlscyIsImVuY29kZV9jZWxsIiwiaGVhZGVyIiwiaGVhZGVyVGV4dCIsIlN0cmluZyIsInQiLCJ2IiwicHVzaCIsIndweCIsIndpZHRoIiwicm93Iiwicm93SW5kZXgiLCJjZWxsRGF0YSIsInZhbHVlS2V5UGF0aCIsImdldEluIiwidmFsdWVSZW5kZXIiLCJ1bmRlZmluZWQiLCJkaXNhYmxlVmFsdWVSZW5kZXJJbkV4Y2VsIiwidmFsdWVUeXBlRXhjZWwiLCJjZWxsIiwiQXJyYXkiLCJpc0FycmF5IiwiTnVtYmVyIiwiam9pbiIsInoiLCJ0b0ZpeGVkIiwiZW5jb2RlX3JhbmdlIiwiZXhwb3J0VG9FeGNlbCIsImZpbGVOYW1lIiwidmlzaWJsZUNvbHVtbnMiLCJzaGVldE5hbWUiLCJleHBvcnRlZENvbHVtbnMiLCJib29rIiwiU2hlZXROYW1lcyIsIlNoZWV0cyIsIndyaXRlRmlsZSIsImJvb2tUeXBlIiwiYm9va1NTVCIsInR5cGUiLCJleHBvcnRTaGVldHNUb0V4Y2VsIiwic2hlZXRzIiwiaW1wb3J0RnJvbUV4Y2VsIiwiZmlsZXMiLCJjYWxsYmFjayIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJyZWFkQXNBcnJheUJ1ZmZlciIsIm9uTG9hZENhbGxiYWNrIiwicmVzdWx0IiwidGFyZ2V0IiwicmVhZCIsImJ0b2EiLCJyYXdEYXRhIiwic2hlZXRfdG9fanNvbiIsInJhdyIsImltcG9ydGVkQ29sdW1ucyIsIml0ZW0iLCJjZWxsSW5kZXgiLCJ2YWx1ZSIsInZhbHVlRXhj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QUFWO0FBQ0Q7QUFDRixLQWxCRDtBQW1CQSxXQUFPNUUsSUFBUDtBQUNELEc7OztBQS9GRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlDQTs7Ozs7Ozs7QUFrQkE7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBK0NhLElBQUlGLEtBQUosRSIsImZpbGUiOiJleGNlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBYTFNYIGZyb20gJ3hsc3gnO1xuXG5pbXBvcnQgeyBnZXRDb2x1bW5zLCBjb252ZXJ0QXJyYXlCdWZmZXJUb1N0cmluZywgY29udmVydFZhbHVlVHlwZSB9IGZyb20gJy4vZXhjZWwudXRpbHMnO1xuaW1wb3J0IGV4cG9ydFNoZWV0cyBmcm9tICcuL3N0eWxlZC1leGNlbC1leHBvcnQnO1xuXG5jbGFzcyBFeGNlbCB7XG4gIGNyZWF0ZVdvcmtzaGVldCA9IChkYXRhLCBjb2x1bW5zLCBkaWdpdHMpID0+IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlcnNjb3JlLWRhbmdsZSAqL1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjFdID0gJzAuMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2Ml0gPSAnMC4wMDAnO1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjNdID0gJzAuMDAwMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2NF0gPSAnMC4wMDAwMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2NV0gPSAnMC4wMDAwMDAnO1xuICAgIGNvbnN0IHNoZWV0ID0ge307XG4gICAgY29uc3Qgc2hlZXRDb2x1bW5zID0gW107XG4gICAgbGV0IGNlbGxSZWYgPSB7fTtcbiAgICBjb25zdCByYW5nZSA9IHsgczogeyBjOiAwLCByOiAwIH0sIGU6IHsgYzogY29sdW1ucy5sZW5ndGggLSAxLCByOiBkYXRhLnNpemUgfSB9O1xuICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBjb2xJbmRleCkgPT4ge1xuICAgICAgY2VsbFJlZiA9IFhMU1gudXRpbHMuZW5jb2RlX2NlbGwoeyBjOiBjb2xJbmRleCwgcjogMCB9KTtcbiAgICAgIGNvbnN0IGhlYWRlciA9IGNvbC5oZWFkZXJUZXh0ID8gU3RyaW5nKGNvbC5oZWFkZXJUZXh0KSA6IFN0cmluZyhjb2wuaGVhZGVyKTtcbiAgICAgIHNoZWV0W2NlbGxSZWZdID0geyB0OiAncycsIHY6IGhlYWRlciB9O1xuICAgICAgc2hlZXRDb2x1bW5zLnB1c2goeyB3cHg6IGNvbC53aWR0aCB9KTtcbiAgICB9KTtcbiAgICBkYXRhLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBjb2xJbmRleCkgPT4ge1xuICAgICAgICBsZXQgY2VsbERhdGEgPSBjb2wudmFsdWVLZXlQYXRoID8gcm93LmdldEluKGNvbC52YWx1ZUtleVBhdGgpIDogJyc7XG4gICAgICAgIGlmIChjb2wudmFsdWVSZW5kZXIgIT09IHVuZGVmaW5lZCAmJiAhY29sLmRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwpIHtcbiAgICAgICAgICBjZWxsRGF0YSA9IFN0cmluZyhjb2wudmFsdWVSZW5kZXIocm93KSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbC52YWx1ZVR5cGVFeGNlbCkge1xuICAgICAgICAgIGNlbGxEYXRhID0gY29udmVydFZhbHVlVHlwZShjZWxsRGF0YSwgY29sLnZhbHVlVHlwZUV4Y2VsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2VsbERhdGEgPT09IG51bGwgfHwgY2VsbERhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNlbGxEYXRhID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2VsbCA9IHsgdjogY2VsbERhdGEgfTtcbiAgICAgICAgY2VsbFJlZiA9IFhMU1gudXRpbHMuZW5jb2RlX2NlbGwoeyBjOiBjb2xJbmRleCwgcjogcm93SW5kZXggKyAxIH0pO1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwudiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBjZWxsLnQgPSAnbic7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGlnaXRzKSAmJiBOdW1iZXIoZGlnaXRzW3Jvd0luZGV4XVtjb2wudmFsdWVLZXlQYXRoLmpvaW4oJy8nKV0pID4gLTEpIHtcbiAgICAgICAgICAgIGNlbGwueiA9IE51bWJlcihYTFNYLlNTRi5fdGFibGVbMl0pLnRvRml4ZWQoZGlnaXRzW3Jvd0luZGV4XVtjb2wudmFsdWVLZXlQYXRoLmpvaW4oJy8nKV0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGRpZ2l0cykgPiAtMSkge1xuICAgICAgICAgICAgY2VsbC56ID0gTnVtYmVyKFhMU1guU1NGLl90YWJsZVsyXSkudG9GaXhlZChkaWdpdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbC52ID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBjZWxsLnQgPSAnYic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2VsbC50ID0gJ3MnO1xuICAgICAgICB9XG4gICAgICAgIHNoZWV0W2NlbGxSZWZdID0gY2VsbDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHNoZWV0WychY29scyddID0gc2hlZXRDb2x1bW5zO1xuICAgIHNoZWV0WychcmVmJ10gPSBYTFNYLnV0aWxzLmVuY29kZV9yYW5nZShyYW5nZSk7XG4gICAgcmV0dXJuIHNoZWV0O1xuICB9O1xuXG4gIC8qKlxuICAgICogRXhwb3J0IGRhdGEgdG8gRXhjZWxcbiAgICAqIElucHV0OlxuICAgICogZGF0YSA6OiBsaXN0LCBkZWZpbmVzIGRhdGEgdG8gZXhwb3J0LFxuICAgICogY29sdW1ucyA6OiBhcnJheSwgZGVmaW5lcyBhbiBhcnJheSBvZiBjb2x1bW4gb2JqZWN0cyB3aXRoIHRoZSBrZXlzOlxuICAgICoge1xuICAgICogIGhlYWRlciA6OiBzdHJpbmcgb3IgZWxlbWVudCwgZGVmaW5lcyB0aGUgY29sdW1uIG5hbWUsXG4gICAgKiAgdmFsdWVLZXlQYXRoIDo6IGFycmF5IG9mIHN0cmluZ3MsIGRlZmluZXMgdGhlIGNvbHVtbiBpZCxcbiAgICAqICB3aWR0aCA6OiBudW1iZXIsIHdpZHRoIGluIHBpeGVscyxcbiAgICAqICBkaXNhYmxlVmFsdWVSZW5kZXJJbkV4Y2VsIDo6IGJvb2wgKG9wdGlvbmFsKSwgZGlzYWJsZSB2YWx1ZVJlbmRlciBjYWxsYmFjayBmb3IgZXhwb3J0XG4gICAgKiAgIHRvIEV4Y2VsLCBpbnN0ZWFkIGV4cG9ydCB2YWx1ZSBkaXJlY3RseSxcbiAgICAqICBoZWFkZXJUZXh0IDo6IHN0cmluZyAob3B0aW9uYWwpLCBuZWVkZWQgaWYgJ2hlYWRlcicgaXMgbm90IGEgdGV4dCxcbiAgICAqICB2YWx1ZVJlbmRlciA6OiBmdW5jdGlvbiAob3B0aW9uYWwpLCBkZWZpbmVzIGEgcmVuZGVyIGZ1bmN0aW9uLFxuICAgICogIHZhbHVlVHlwZUV4Y2VsIDo6IHN0cmluZyAob3B0aW9uYWwpLCBkZWZpbmVzIGEgdmFsdWUgdHlwZSBmb3IgRXhjZWwgaWYgZGlmZmVycyBmcm9tIFVJXG4gICAgKiB9LFxuICAgICogZmlsZU5hbWUgOjogc3RyaW5nIChvcHRpb25hbCksIGRlZmluZXMgYSBmaWxlIG5hbWUsXG4gICAgKiBkaWdpdHMgOjogW251bWJlciwgYXJyYXldIChvcHRpb25hbCksIGRlZmluZXMgYSBudW1iZXIgb2YgZGlnaXRzIGZvciBkZWNpbWFscyBpbiBhbGwgdGFibGVcbiAgICAqICAgb3IgYW4gYXJyYXkgY29udGFpbmluZyBkaWdpdHMgZm9yIGNlbGxzLFxuICAgICogdmlzaWJsZUNvbHVtbnMgOjogbGlzdCAob3B0aW9uYWwpLCBkZWZpbmVzIHZpc2libGUgY29sdW1ucyBpbiBjYXNlIGNvbHVtbiBzZXR0aW5ncyBhcmUgdXNlZC5cbiAgICAqL1xuICBleHBvcnRUb0V4Y2VsID0gKGRhdGEsIGNvbHVtbnMsIGZpbGVOYW1lID0gJ0V4cG9ydCBGcm9tIE9DJywgZGlnaXRzID0gbnVsbCwgdmlzaWJsZUNvbHVtbnMgPSBudWxsKSA9PiB7XG4gICAgY29uc3Qgc2hlZXROYW1lID0gJ1NoZWV0MSc7XG4gICAgY29uc3QgZXhwb3J0ZWRDb2x1bW5zID0gZ2V0Q29sdW1ucyhjb2x1bW5zLCB2aXNpYmxlQ29sdW1ucyk7XG4gICAgY29uc3Qgc2hlZXQgPSB0aGlzLmNyZWF0ZVdvcmtzaGVldChkYXRhLCBleHBvcnRlZENvbHVtbnMsIGRpZ2l0cyk7XG4gICAgY29uc3QgYm9vayA9IHsgU2hlZXROYW1lczogW3NoZWV0TmFtZV0sIFNoZWV0czoge30gfTtcbiAgICBib29rLlNoZWV0c1tzaGVldE5hbWVdID0gc2hlZXQ7XG4gICAgWExTWC53cml0ZUZpbGUoYm9vaywgYCR7ZmlsZU5hbWV9Lnhsc3hgLCB7IGJvb2tUeXBlOiAneGxzeCcsIGJvb2tTU1Q6IHRydWUsIHR5cGU6ICdiaW5hcnknIH0pO1xuICB9O1xuXG4gIGV4cG9ydFNoZWV0c1RvRXhjZWwgPSAoc2hlZXRzLCBmaWxlTmFtZSkgPT4ge1xuICAgIGV4cG9ydFNoZWV0cyhzaGVldHMsIGZpbGVOYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnQgZGF0YSBmcm9tIEV4Y2VsXG4gICAqIElucHV0OlxuICAgKiBmaWxlcyA6OiBldmVudC50YXJnZXQuZmlsZXMgYXJyYXksXG4gICAqIGNhbGxiYWNrIDo6IGZ1bmN0aW9uLCBvbkxvYWQgY2FsbGJhY2suXG4gICAqL1xuICBpbXBvcnRGcm9tRXhjZWwgPSAoZmlsZXMsIGNhbGxiYWNrKSA9PiB7XG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZmlsZXNbMF0udHlwZSAhPT0gJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIHJlYWRlci5vbmxvYWQgPSBjYWxsYmFjaztcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoZmlsZXNbMF0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBvbiBsb2FkIG9mIEZpbGVSZWFkZXIgZm9yIGltcG9ydCBvcGVyYXRpb25cbiAgICogSW5wdXQ6XG4gICAqIGUgOjogZXZlbnQgb2JqZWN0LFxuICAgKiBjb2x1bW5zIDo6IGFycmF5LCBkZWZpbmVzIGNvbHVtbiBvYmplY3RzIHdpdGggdGhlIGtleXM6XG4gICAqIHtcbiAgICogIHZhbHVlS2V5UGF0aCA6OiBhcnJheSBvZiBzdHJpbmdzLCBkZWZpbmVzIHRoZSBjb2x1bW4gaWQsXG4gICAqICB2YWx1ZUV4Y2VsTWF0Y2ggOjogZnVuY3Rpb24gKG9wdGlvbmFsKSwgY2FsbGJhY2sgdG8gdXBkYXRlIHRoZSB2YWx1ZSBpbiBpbXBvcnRlZCBkYXRhLFxuICAgKiAgZGVmYXVsdFZhbHVlIDo6IGFueSAob3B0aW9uYWwpLCBkZWZpbmVzIGEgZGVmYXVsdCB2YWx1ZVxuICAgKiB9LFxuICAgKiB2aXNpYmxlQ29sdW1ucyA6OiBsaXN0IChvcHRpb25hbCksIGRlZmluZXMgdmlzaWJsZSBjb2x1bW5zIGluIGNhc2UgY29sdW1uIHNldHRpbmdzIGlzIHVzZWQuXG4gICAqIE91dHB1dDpcbiAgICogYXJyYXkgb2YgaW1wb3J0ZWQgZGF0YS5cbiAgICovXG4gIG9uTG9hZENhbGxiYWNrID0gKGUsIGNvbHVtbnMsIHZpc2libGVDb2x1bW5zID0gbnVsbCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGNvbnZlcnRBcnJheUJ1ZmZlclRvU3RyaW5nKGUudGFyZ2V0LnJlc3VsdCk7XG4gICAgY29uc3QgYm9vayA9IFhMU1gucmVhZChidG9hKHJlc3VsdCksIHsgdHlwZTogJ2Jhc2U2NCcgfSk7XG4gICAgY29uc3QgcmF3RGF0YSA9IFhMU1gudXRpbHNcbiAgICAgIC5zaGVldF90b19qc29uKGJvb2suU2hlZXRzW2Jvb2suU2hlZXROYW1lc1swXV0sIHsgaGVhZGVyOiAxLCByYXc6IHRydWUgfSk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmF3RGF0YSkgJiYgcmF3RGF0YS5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGltcG9ydGVkQ29sdW1ucyA9IGdldENvbHVtbnMoY29sdW1ucywgdmlzaWJsZUNvbHVtbnMpO1xuICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICByYXdEYXRhLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICAgIC8vIHNraXAgdGhlIGhlYWRlclxuICAgICAgaWYgKHJvd0luZGV4ID49IDEpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHt9O1xuICAgICAgICByb3cuZm9yRWFjaCgoY2VsbCwgY2VsbEluZGV4KSA9PiB7XG4gICAgICAgICAgaWYgKGNlbGxJbmRleCA8IGltcG9ydGVkQ29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gaW1wb3J0ZWRDb2x1bW5zW2NlbGxJbmRleF0udmFsdWVFeGNlbE1hdGNoICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgPyBpbXBvcnRlZENvbHVtbnNbY2VsbEluZGV4XS52YWx1ZUV4Y2VsTWF0Y2goY2VsbCkgOiBjZWxsO1xuICAgICAgICAgICAgaXRlbVtpbXBvcnRlZENvbHVtbnNbY2VsbEluZGV4XS52YWx1ZUtleVBhdGhbMF1dID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaW1wb3J0ZWRDb2x1bW5zLmZvckVhY2goKGNvbHVtbikgPT4ge1xuICAgICAgICAgIGlmIChjb2x1bW4uZGVmYXVsdFZhbHVlICE9PSB1bmRlZmluZWQgJiYgaXRlbVtjb2x1bW4udmFsdWVLZXlQYXRoWzBdXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpdGVtW2NvbHVtbi52YWx1ZUtleVBhdGhbMF1dID0gY29sdW1uLmRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkYXRhLnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEV4Y2VsKCk7XG4iXX0=