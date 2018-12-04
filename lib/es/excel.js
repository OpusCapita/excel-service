function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import XLSX from 'xlsx';

import { getColumns, convertArrayBufferToString, convertValueType } from './excel.utils';
import exportSheets from './styled-excel-export';

var Excel = function Excel() {
  var _this = this;

  _classCallCheck(this, Excel);

  this.createWorksheet = function (data, columns, digits) {
    /* eslint-disable no-underscore-dangle */
    XLSX.SSF._table[161] = '0.0';
    XLSX.SSF._table[162] = '0.000';
    XLSX.SSF._table[163] = '0.0000';
    XLSX.SSF._table[164] = '0.00000';
    XLSX.SSF._table[165] = '0.000000';
    var sheet = {};
    var sheetColumns = [];
    var cellRef = {};
    var range = { s: { c: 0, r: 0 }, e: { c: columns.length - 1, r: data.size } };
    columns.forEach(function (col, colIndex) {
      cellRef = XLSX.utils.encode_cell({ c: colIndex, r: 0 });
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
          cellData = convertValueType(cellData, col.valueTypeExcel);
        }
        if (cellData === null || cellData === undefined) {
          cellData = '';
        }
        var cell = { v: cellData };
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

  this.exportToExcel = function (data, columns) {
    var fileName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Export From OC';
    var digits = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var visibleColumns = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    var sheetName = 'Sheet1';
    var exportedColumns = getColumns(columns, visibleColumns);
    var sheet = _this.createWorksheet(data, exportedColumns, digits);
    var book = { SheetNames: [sheetName], Sheets: {} };
    book.Sheets[sheetName] = sheet;
    XLSX.writeFile(book, fileName + '.xlsx', { bookType: 'xlsx', bookSST: true, type: 'binary' });
  };

  this.exportSheetsToExcel = function (sheets, fileName) {
    exportSheets(sheets, fileName);
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

    var result = convertArrayBufferToString(e.target.result);
    var book = XLSX.read(btoa(result), { type: 'base64' });
    var rawData = XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, raw: true });
    if (Array.isArray(rawData) && rawData.length < 2) {
      return [];
    }
    var importedColumns = getColumns(columns, visibleColumns);
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

export default new Excel();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leGNlbC5qcyJdLCJuYW1lcyI6WyJYTFNYIiwiZ2V0Q29sdW1ucyIsImNvbnZlcnRBcnJheUJ1ZmZlclRvU3RyaW5nIiwiY29udmVydFZhbHVlVHlwZSIsImV4cG9ydFNoZWV0cyIsIkV4Y2VsIiwiY3JlYXRlV29ya3NoZWV0IiwiZGF0YSIsImNvbHVtbnMiLCJkaWdpdHMiLCJTU0YiLCJfdGFibGUiLCJzaGVldCIsInNoZWV0Q29sdW1ucyIsImNlbGxSZWYiLCJyYW5nZSIsInMiLCJjIiwiciIsImUiLCJsZW5ndGgiLCJzaXplIiwiZm9yRWFjaCIsImNvbCIsImNvbEluZGV4IiwidXRpbHMiLCJlbmNvZGVfY2VsbCIsImhlYWRlciIsImhlYWRlclRleHQiLCJTdHJpbmciLCJ0IiwidiIsInB1c2giLCJ3cHgiLCJ3aWR0aCIsInJvdyIsInJvd0luZGV4IiwiY2VsbERhdGEiLCJ2YWx1ZUtleVBhdGgiLCJnZXRJbiIsInZhbHVlUmVuZGVyIiwidW5kZWZpbmVkIiwiZGlzYWJsZVZhbHVlUmVuZGVySW5FeGNlbCIsInZhbHVlVHlwZUV4Y2VsIiwiY2VsbCIsIkFycmF5IiwiaXNBcnJheSIsIk51bWJlciIsImpvaW4iLCJ6IiwidG9GaXhlZCIsImVuY29kZV9yYW5nZSIsImV4cG9ydFRvRXhjZWwiLCJmaWxlTmFtZSIsInZpc2libGVDb2x1bW5zIiwic2hlZXROYW1lIiwiZXhwb3J0ZWRDb2x1bW5zIiwiYm9vayIsIlNoZWV0TmFtZXMiLCJTaGVldHMiLCJ3cml0ZUZpbGUiLCJib29rVHlwZSIsImJvb2tTU1QiLCJ0eXBlIiwiZXhwb3J0U2hlZXRzVG9FeGNlbCIsInNoZWV0cyIsImltcG9ydEZyb21FeGNlbCIsImZpbGVzIiwiY2FsbGJhY2siLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwicmVhZEFzQXJyYXlCdWZmZXIiLCJvbkxvYWRDYWxsYmFjayIsInJlc3VsdCIsInRhcmdldCIsInJlYWQiLCJidG9hIiwicmF3RGF0YSIsInNoZWV0X3RvX2pzb24iLCJyYXciLCJpbXBvcnRlZENvbHVtbnMiLCJpdGVtIiwiY2VsbEluZGV4IiwidmFsdWUiLCJ2YWx1ZUV4Y2VsTWF0Y2giLCJjb2x1bW4iLCJkZWZhdWx0VmFsdWUiXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBT0EsSUFBUCxNQUFpQixNQUFqQjs7QUFFQSxTQUFTQyxVQUFULEVBQXFCQywwQkFBckIsRUFBaURDLGdCQUFqRCxRQUF5RSxlQUF6RTtBQUNBLE9BQU9DLFlBQVAsTUFBeUIsdUJBQXpCOztJQUVNQyxLOzs7OztPQUNKQyxlLEdBQWtCLFVBQUNDLElBQUQsRUFBT0MsT0FBUCxFQUFnQkMsTUFBaEIsRUFBMkI7QUFDM0M7QUFDQVQsU0FBS1UsR0FBTCxDQUFTQyxNQUFULENBQWdCLEdBQWhCLElBQXVCLEtBQXZCO0FBQ0FYLFNBQUtVLEdBQUwsQ0FBU0MsTUFBVCxDQUFnQixHQUFoQixJQUF1QixPQUF2QjtBQUNBWCxTQUFLVSxHQUFMLENBQVNDLE1BQVQsQ0FBZ0IsR0FBaEIsSUFBdUIsUUFBdkI7QUFDQVgsU0FBS1UsR0FBTCxDQUFTQyxNQUFULENBQWdCLEdBQWhCLElBQXVCLFNBQXZCO0FBQ0FYLFNBQUtVLEdBQUwsQ0FBU0MsTUFBVCxDQUFnQixHQUFoQixJQUF1QixVQUF2QjtBQUNBLFFBQU1DLFFBQVEsRUFBZDtBQUNBLFFBQU1DLGVBQWUsRUFBckI7QUFDQSxRQUFJQyxVQUFVLEVBQWQ7QUFDQSxRQUFNQyxRQUFRLEVBQUVDLEdBQUcsRUFBRUMsR0FBRyxDQUFMLEVBQVFDLEdBQUcsQ0FBWCxFQUFMLEVBQXFCQyxHQUFHLEVBQUVGLEdBQUdULFFBQVFZLE1BQVIsR0FBaUIsQ0FBdEIsRUFBeUJGLEdBQUdYLEtBQUtjLElBQWpDLEVBQXhCLEVBQWQ7QUFDQWIsWUFBUWMsT0FBUixDQUFnQixVQUFDQyxHQUFELEVBQU1DLFFBQU4sRUFBbUI7QUFDakNWLGdCQUFVZCxLQUFLeUIsS0FBTCxDQUFXQyxXQUFYLENBQXVCLEVBQUVULEdBQUdPLFFBQUwsRUFBZU4s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Q3lDLEtBQUtJLE9BQU9oRCxZQUFQLENBQW9CLENBQXBCLENBQUwsTUFBaUNHLFNBQTFFLEVBQXFGO0FBQ25GeUMsaUJBQUtJLE9BQU9oRCxZQUFQLENBQW9CLENBQXBCLENBQUwsSUFBK0JnRCxPQUFPQyxZQUF0QztBQUNEO0FBQ0YsU0FKRDtBQUtBaEYsYUFBS3lCLElBQUwsQ0FBVWtELElBQVY7QUFDRDtBQUNGLEtBbEJEO0FBbUJBLFdBQU8zRSxJQUFQO0FBQ0QsRzs7O0FBL0ZEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUNBOzs7Ozs7OztBQWtCQTs7Ozs7Ozs7Ozs7Ozs7OztBQStDRixlQUFlLElBQUlGLEtBQUosRUFBZiIsImZpbGUiOiJleGNlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBYTFNYIGZyb20gJ3hsc3gnO1xuXG5pbXBvcnQgeyBnZXRDb2x1bW5zLCBjb252ZXJ0QXJyYXlCdWZmZXJUb1N0cmluZywgY29udmVydFZhbHVlVHlwZSB9IGZyb20gJy4vZXhjZWwudXRpbHMnO1xuaW1wb3J0IGV4cG9ydFNoZWV0cyBmcm9tICcuL3N0eWxlZC1leGNlbC1leHBvcnQnO1xuXG5jbGFzcyBFeGNlbCB7XG4gIGNyZWF0ZVdvcmtzaGVldCA9IChkYXRhLCBjb2x1bW5zLCBkaWdpdHMpID0+IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlcnNjb3JlLWRhbmdsZSAqL1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjFdID0gJzAuMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2Ml0gPSAnMC4wMDAnO1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjNdID0gJzAuMDAwMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2NF0gPSAnMC4wMDAwMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2NV0gPSAnMC4wMDAwMDAnO1xuICAgIGNvbnN0IHNoZWV0ID0ge307XG4gICAgY29uc3Qgc2hlZXRDb2x1bW5zID0gW107XG4gICAgbGV0IGNlbGxSZWYgPSB7fTtcbiAgICBjb25zdCByYW5nZSA9IHsgczogeyBjOiAwLCByOiAwIH0sIGU6IHsgYzogY29sdW1ucy5sZW5ndGggLSAxLCByOiBkYXRhLnNpemUgfSB9O1xuICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBjb2xJbmRleCkgPT4ge1xuICAgICAgY2VsbFJlZiA9IFhMU1gudXRpbHMuZW5jb2RlX2NlbGwoeyBjOiBjb2xJbmRleCwgcjogMCB9KTtcbiAgICAgIGNvbnN0IGhlYWRlciA9IGNvbC5oZWFkZXJUZXh0ID8gU3RyaW5nKGNvbC5oZWFkZXJUZXh0KSA6IFN0cmluZyhjb2wuaGVhZGVyKTtcbiAgICAgIHNoZWV0W2NlbGxSZWZdID0geyB0OiAncycsIHY6IGhlYWRlciB9O1xuICAgICAgc2hlZXRDb2x1bW5zLnB1c2goeyB3cHg6IGNvbC53aWR0aCB9KTtcbiAgICB9KTtcbiAgICBkYXRhLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBjb2xJbmRleCkgPT4ge1xuICAgICAgICBsZXQgY2VsbERhdGEgPSBjb2wudmFsdWVLZXlQYXRoID8gcm93LmdldEluKGNvbC52YWx1ZUtleVBhdGgpIDogJyc7XG4gICAgICAgIGlmIChjb2wudmFsdWVSZW5kZXIgIT09IHVuZGVmaW5lZCAmJiAhY29sLmRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwpIHtcbiAgICAgICAgICBjZWxsRGF0YSA9IFN0cmluZyhjb2wudmFsdWVSZW5kZXIocm93KSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbC52YWx1ZVR5cGVFeGNlbCkge1xuICAgICAgICAgIGNlbGxEYXRhID0gY29udmVydFZhbHVlVHlwZShjZWxsRGF0YSwgY29sLnZhbHVlVHlwZUV4Y2VsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2VsbERhdGEgPT09IG51bGwgfHwgY2VsbERhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNlbGxEYXRhID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2VsbCA9IHsgdjogY2VsbERhdGEgfTtcbiAgICAgICAgY2VsbFJlZiA9IFhMU1gudXRpbHMuZW5jb2RlX2NlbGwoeyBjOiBjb2xJbmRleCwgcjogcm93SW5kZXggKyAxIH0pO1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwudiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBjZWxsLnQgPSAnbic7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGlnaXRzKSAmJiBOdW1iZXIoZGlnaXRzW3Jvd0luZGV4XVtjb2wudmFsdWVLZXlQYXRoLmpvaW4oJy8nKV0pID4gLTEpIHtcbiAgICAgICAgICAgIGNlbGwueiA9IE51bWJlcihYTFNYLlNTRi5fdGFibGVbMl0pLnRvRml4ZWQoZGlnaXRzW3Jvd0luZGV4XVtjb2wudmFsdWVLZXlQYXRoLmpvaW4oJy8nKV0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGRpZ2l0cykgPiAtMSkge1xuICAgICAgICAgICAgY2VsbC56ID0gTnVtYmVyKFhMU1guU1NGLl90YWJsZVsyXSkudG9GaXhlZChkaWdpdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbC52ID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBjZWxsLnQgPSAnYic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2VsbC50ID0gJ3MnO1xuICAgICAgICB9XG4gICAgICAgIHNoZWV0W2NlbGxSZWZdID0gY2VsbDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHNoZWV0WychY29scyddID0gc2hlZXRDb2x1bW5zO1xuICAgIHNoZWV0WychcmVmJ10gPSBYTFNYLnV0aWxzLmVuY29kZV9yYW5nZShyYW5nZSk7XG4gICAgcmV0dXJuIHNoZWV0O1xuICB9O1xuXG4gIC8qKlxuICAgICogRXhwb3J0IGRhdGEgdG8gRXhjZWxcbiAgICAqIElucHV0OlxuICAgICogZGF0YSA6OiBsaXN0LCBkZWZpbmVzIGRhdGEgdG8gZXhwb3J0LFxuICAgICogY29sdW1ucyA6OiBhcnJheSwgZGVmaW5lcyBhbiBhcnJheSBvZiBjb2x1bW4gb2JqZWN0cyB3aXRoIHRoZSBrZXlzOlxuICAgICoge1xuICAgICogIGhlYWRlciA6OiBzdHJpbmcgb3IgZWxlbWVudCwgZGVmaW5lcyB0aGUgY29sdW1uIG5hbWUsXG4gICAgKiAgdmFsdWVLZXlQYXRoIDo6IGFycmF5IG9mIHN0cmluZ3MsIGRlZmluZXMgdGhlIGNvbHVtbiBpZCxcbiAgICAqICB3aWR0aCA6OiBudW1iZXIsIHdpZHRoIGluIHBpeGVscyxcbiAgICAqICBkaXNhYmxlVmFsdWVSZW5kZXJJbkV4Y2VsIDo6IGJvb2wgKG9wdGlvbmFsKSwgZGlzYWJsZSB2YWx1ZVJlbmRlciBjYWxsYmFjayBmb3IgZXhwb3J0XG4gICAgKiAgIHRvIEV4Y2VsLCBpbnN0ZWFkIGV4cG9ydCB2YWx1ZSBkaXJlY3RseSxcbiAgICAqICBoZWFkZXJUZXh0IDo6IHN0cmluZyAob3B0aW9uYWwpLCBuZWVkZWQgaWYgJ2hlYWRlcicgaXMgbm90IGEgdGV4dCxcbiAgICAqICB2YWx1ZVJlbmRlciA6OiBmdW5jdGlvbiAob3B0aW9uYWwpLCBkZWZpbmVzIGEgcmVuZGVyIGZ1bmN0aW9uLFxuICAgICogIHZhbHVlVHlwZUV4Y2VsIDo6IHN0cmluZyAob3B0aW9uYWwpLCBkZWZpbmVzIGEgdmFsdWUgdHlwZSBmb3IgRXhjZWwgaWYgZGlmZmVycyBmcm9tIFVJXG4gICAgKiB9LFxuICAgICogZmlsZU5hbWUgOjogc3RyaW5nIChvcHRpb25hbCksIGRlZmluZXMgYSBmaWxlIG5hbWUsXG4gICAgKiBkaWdpdHMgOjogW251bWJlciwgYXJyYXldIChvcHRpb25hbCksIGRlZmluZXMgYSBudW1iZXIgb2YgZGlnaXRzIGZvciBkZWNpbWFscyBpbiBhbGwgdGFibGVcbiAgICAqICAgb3IgYW4gYXJyYXkgY29udGFpbmluZyBkaWdpdHMgZm9yIGNlbGxzLFxuICAgICogdmlzaWJsZUNvbHVtbnMgOjogbGlzdCAob3B0aW9uYWwpLCBkZWZpbmVzIHZpc2libGUgY29sdW1ucyBpbiBjYXNlIGNvbHVtbiBzZXR0aW5ncyBhcmUgdXNlZC5cbiAgICAqL1xuICBleHBvcnRUb0V4Y2VsID0gKGRhdGEsIGNvbHVtbnMsIGZpbGVOYW1lID0gJ0V4cG9ydCBGcm9tIE9DJywgZGlnaXRzID0gbnVsbCwgdmlzaWJsZUNvbHVtbnMgPSBudWxsKSA9PiB7XG4gICAgY29uc3Qgc2hlZXROYW1lID0gJ1NoZWV0MSc7XG4gICAgY29uc3QgZXhwb3J0ZWRDb2x1bW5zID0gZ2V0Q29sdW1ucyhjb2x1bW5zLCB2aXNpYmxlQ29sdW1ucyk7XG4gICAgY29uc3Qgc2hlZXQgPSB0aGlzLmNyZWF0ZVdvcmtzaGVldChkYXRhLCBleHBvcnRlZENvbHVtbnMsIGRpZ2l0cyk7XG4gICAgY29uc3QgYm9vayA9IHsgU2hlZXROYW1lczogW3NoZWV0TmFtZV0sIFNoZWV0czoge30gfTtcbiAgICBib29rLlNoZWV0c1tzaGVldE5hbWVdID0gc2hlZXQ7XG4gICAgWExTWC53cml0ZUZpbGUoYm9vaywgYCR7ZmlsZU5hbWV9Lnhsc3hgLCB7IGJvb2tUeXBlOiAneGxzeCcsIGJvb2tTU1Q6IHRydWUsIHR5cGU6ICdiaW5hcnknIH0pO1xuICB9O1xuXG4gIGV4cG9ydFNoZWV0c1RvRXhjZWwgPSAoc2hlZXRzLCBmaWxlTmFtZSkgPT4ge1xuICAgIGV4cG9ydFNoZWV0cyhzaGVldHMsIGZpbGVOYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnQgZGF0YSBmcm9tIEV4Y2VsXG4gICAqIElucHV0OlxuICAgKiBmaWxlcyA6OiBldmVudC50YXJnZXQuZmlsZXMgYXJyYXksXG4gICAqIGNhbGxiYWNrIDo6IGZ1bmN0aW9uLCBvbkxvYWQgY2FsbGJhY2suXG4gICAqL1xuICBpbXBvcnRGcm9tRXhjZWwgPSAoZmlsZXMsIGNhbGxiYWNrKSA9PiB7XG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZmlsZXNbMF0udHlwZSAhPT0gJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIHJlYWRlci5vbmxvYWQgPSBjYWxsYmFjaztcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoZmlsZXNbMF0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBvbiBsb2FkIG9mIEZpbGVSZWFkZXIgZm9yIGltcG9ydCBvcGVyYXRpb25cbiAgICogSW5wdXQ6XG4gICAqIGUgOjogZXZlbnQgb2JqZWN0LFxuICAgKiBjb2x1bW5zIDo6IGFycmF5LCBkZWZpbmVzIGNvbHVtbiBvYmplY3RzIHdpdGggdGhlIGtleXM6XG4gICAqIHtcbiAgICogIHZhbHVlS2V5UGF0aCA6OiBhcnJheSBvZiBzdHJpbmdzLCBkZWZpbmVzIHRoZSBjb2x1bW4gaWQsXG4gICAqICB2YWx1ZUV4Y2VsTWF0Y2ggOjogZnVuY3Rpb24gKG9wdGlvbmFsKSwgY2FsbGJhY2sgdG8gdXBkYXRlIHRoZSB2YWx1ZSBpbiBpbXBvcnRlZCBkYXRhLFxuICAgKiAgZGVmYXVsdFZhbHVlIDo6IGFueSAob3B0aW9uYWwpLCBkZWZpbmVzIGEgZGVmYXVsdCB2YWx1ZVxuICAgKiB9LFxuICAgKiB2aXNpYmxlQ29sdW1ucyA6OiBsaXN0IChvcHRpb25hbCksIGRlZmluZXMgdmlzaWJsZSBjb2x1bW5zIGluIGNhc2UgY29sdW1uIHNldHRpbmdzIGlzIHVzZWQuXG4gICAqIE91dHB1dDpcbiAgICogYXJyYXkgb2YgaW1wb3J0ZWQgZGF0YS5cbiAgICovXG4gIG9uTG9hZENhbGxiYWNrID0gKGUsIGNvbHVtbnMsIHZpc2libGVDb2x1bW5zID0gbnVsbCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGNvbnZlcnRBcnJheUJ1ZmZlclRvU3RyaW5nKGUudGFyZ2V0LnJlc3VsdCk7XG4gICAgY29uc3QgYm9vayA9IFhMU1gucmVhZChidG9hKHJlc3VsdCksIHsgdHlwZTogJ2Jhc2U2NCcgfSk7XG4gICAgY29uc3QgcmF3RGF0YSA9IFhMU1gudXRpbHNcbiAgICAgIC5zaGVldF90b19qc29uKGJvb2suU2hlZXRzW2Jvb2suU2hlZXROYW1lc1swXV0sIHsgaGVhZGVyOiAxLCByYXc6IHRydWUgfSk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmF3RGF0YSkgJiYgcmF3RGF0YS5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGltcG9ydGVkQ29sdW1ucyA9IGdldENvbHVtbnMoY29sdW1ucywgdmlzaWJsZUNvbHVtbnMpO1xuICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICByYXdEYXRhLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICAgIC8vIHNraXAgdGhlIGhlYWRlclxuICAgICAgaWYgKHJvd0luZGV4ID49IDEpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHt9O1xuICAgICAgICByb3cuZm9yRWFjaCgoY2VsbCwgY2VsbEluZGV4KSA9PiB7XG4gICAgICAgICAgaWYgKGNlbGxJbmRleCA8IGltcG9ydGVkQ29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gaW1wb3J0ZWRDb2x1bW5zW2NlbGxJbmRleF0udmFsdWVFeGNlbE1hdGNoICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgPyBpbXBvcnRlZENvbHVtbnNbY2VsbEluZGV4XS52YWx1ZUV4Y2VsTWF0Y2goY2VsbCkgOiBjZWxsO1xuICAgICAgICAgICAgaXRlbVtpbXBvcnRlZENvbHVtbnNbY2VsbEluZGV4XS52YWx1ZUtleVBhdGhbMF1dID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaW1wb3J0ZWRDb2x1bW5zLmZvckVhY2goKGNvbHVtbikgPT4ge1xuICAgICAgICAgIGlmIChjb2x1bW4uZGVmYXVsdFZhbHVlICE9PSB1bmRlZmluZWQgJiYgaXRlbVtjb2x1bW4udmFsdWVLZXlQYXRoWzBdXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpdGVtW2NvbHVtbi52YWx1ZUtleVBhdGhbMF1dID0gY29sdW1uLmRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkYXRhLnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEV4Y2VsKCk7XG4iXX0=