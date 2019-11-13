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
          cell.z = '@';
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
    var importedColumns = void 0;
    var data = [];
    rawData.forEach(function (row, rowIndex) {
      if (rowIndex === 0) {
        importedColumns = typeof columns === 'function' ? getColumns(columns(row), visibleColumns) : getColumns(columns, visibleColumns);
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leGNlbC5qcyJdLCJuYW1lcyI6WyJYTFNYIiwiZ2V0Q29sdW1ucyIsImNvbnZlcnRBcnJheUJ1ZmZlclRvU3RyaW5nIiwiY29udmVydFZhbHVlVHlwZSIsImV4cG9ydFNoZWV0cyIsIkV4Y2VsIiwiY3JlYXRlV29ya3NoZWV0IiwiZGF0YSIsImNvbHVtbnMiLCJkaWdpdHMiLCJTU0YiLCJfdGFibGUiLCJzaGVldCIsInNoZWV0Q29sdW1ucyIsImNlbGxSZWYiLCJyYW5nZSIsInMiLCJjIiwiciIsImUiLCJsZW5ndGgiLCJzaXplIiwiZm9yRWFjaCIsImNvbCIsImNvbEluZGV4IiwidXRpbHMiLCJlbmNvZGVfY2VsbCIsImhlYWRlciIsImhlYWRlclRleHQiLCJTdHJpbmciLCJ0IiwidiIsInB1c2giLCJ3cHgiLCJ3aWR0aCIsInJvdyIsInJvd0luZGV4IiwiY2VsbERhdGEiLCJ2YWx1ZUtleVBhdGgiLCJnZXRJbiIsInZhbHVlUmVuZGVyIiwidW5kZWZpbmVkIiwiZGlzYWJsZVZhbHVlUmVuZGVySW5FeGNlbCIsInZhbHVlVHlwZUV4Y2VsIiwiY2VsbCIsIkFycmF5IiwiaXNBcnJheSIsIk51bWJlciIsImpvaW4iLCJ6IiwidG9GaXhlZCIsImVuY29kZV9yYW5nZSIsImV4cG9ydFRvRXhjZWwiLCJmaWxlTmFtZSIsInZpc2libGVDb2x1bW5zIiwic2hlZXROYW1lIiwiZXhwb3J0ZWRDb2x1bW5zIiwiYm9vayIsIlNoZWV0TmFtZXMiLCJTaGVldHMiLCJ3cml0ZUZpbGUiLCJib29rVHlwZSIsImJvb2tTU1QiLCJ0eXBlIiwiZXhwb3J0U2hlZXRzVG9FeGNlbCIsInNoZWV0cyIsImltcG9ydEZyb21FeGNlbCIsImZpbGVzIiwiY2FsbGJhY2siLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwicmVhZEFzQXJyYXlCdWZmZXIiLCJvbkxvYWRDYWxsYmFjayIsInJlc3VsdCIsInRhcmdldCIsInJlYWQiLCJidG9hIiwicmF3RGF0YSIsInNoZWV0X3RvX2pzb24iLCJyYXciLCJpbXBvcnRlZENvbHVtbnMiLCJpdGVtIiwiY2VsbEluZGV4IiwidmFsdWUiLCJ2YWx1ZUV4Y2VsTWF0Y2giLCJjb2x1bW4iLCJkZWZhdWx0VmFsdWUiXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBT0EsSUFBUCxNQUFpQixNQUFqQjs7QUFFQSxTQUFTQyxVQUFULEVBQXFCQywwQkFBckIsRUFBaURDLGdCQUFqRCxRQUF5RSxlQUF6RTtBQUNBLE9BQU9DLFlBQVAsTUFBeUIsdUJBQXpCOztJQUVNQyxLOzs7OztPQUNKQyxlLEdBQWtCLFVBQUNDLElBQUQsRUFBT0MsT0FBUCxFQUFnQkMsTUFBaEIsRUFBMkI7QUFDM0M7QUFDQVQsU0FBS1UsR0FBTCxDQUFTQyxNQUFULENBQWdCLEdBQWhCLElBQXVCLEtBQXZCO0FBQ0FYLFNBQUtVLEdBQUwsQ0FBU0MsTUFBVCxDQUFnQixHQUFoQixJQUF1QixPQUF2QjtBQUNBWCxTQUFLVSxHQUFMLENBQVNDLE1BQVQsQ0FBZ0IsR0FBaEIsSUFBdUIsUUFBdkI7QUFDQVgsU0FBS1UsR0FBTCxDQUFTQyxNQUFULENBQWdCLEdBQWhCLElBQXVCLFNBQXZCO0FBQ0FYLFNBQUtVLEdBQUwsQ0FBU0MsTUFBVCxDQUFnQixHQUFoQixJQUF1QixVQUF2QjtBQUNBLFFBQU1DLFFBQVEsRUFBZDtBQUNBLFFBQU1DLGVBQWUsRUFBckI7QUFDQSxRQUFJQyxVQUFVLEVBQWQ7QUFDQSxRQUFNQyxRQUFRLEVBQUVDLEdBQUcsRUFBRUMsR0FBRyxDQUFMLEVBQVFDLEdBQUcsQ0FBWCxFQUFMLEVBQXFCQyxHQUFHLEVBQUVGLEdBQUdULFFBQVFZLE1BQVIsR0FBaUIsQ0FBdEIsRUFBeUJGLEdBQUdYLEtBQUtjLElBQWpDLEVBQXhCLEVBQWQ7QUFDQWIsWUFBUWMsT0FBUixDQUFnQixVQUFDQyxHQUFELEVBQU1DLFFBQU4sRUFBbUI7QUFDakNWLGdCQUFVZCxLQUFLeUIsS0FBTCxDQUFXQyxXQUFYLENBQXVCLEVBQUVULEdBQUdPLFFBQUwsRUFBZU4s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QUFoQixFQUEyQjdDLFlBQTNCLENBQXdDLENBQXhDLENBQUwsSUFBbUQ4QyxLQUFuRDtBQUNEO0FBQ0YsU0FORDtBQU9BSCx3QkFBZ0IzRCxPQUFoQixDQUF3QixVQUFDZ0UsTUFBRCxFQUFZO0FBQ2xDLGNBQUlBLE9BQU9DLFlBQVAsS0FBd0I5QyxTQUF4QixJQUFxQ3lDLEtBQUtJLE9BQU9oRCxZQUFQLENBQW9CLENBQXBCLENBQUwsTUFBaUNHLFNBQTFFLEVBQXFGO0FBQ25GeUMsaUJBQUtJLE9BQU9oRCxZQUFQLENBQW9CLENBQXBCLENBQUwsSUFBK0JnRCxPQUFPQyxZQUF0QztBQUNEO0FBQ0YsU0FKRDtBQUtBaEYsYUFBS3lCLElBQUwsQ0FBVWtELElBQVY7QUFDRDtBQUNGLEtBcEJEO0FBcUJBLFdBQU8zRSxJQUFQO0FBQ0QsRzs7O0FBakdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUNBOzs7Ozs7OztBQWtCQTs7Ozs7Ozs7Ozs7Ozs7OztBQWlERixlQUFlLElBQUlGLEtBQUosRUFBZiIsImZpbGUiOiJleGNlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBYTFNYIGZyb20gJ3hsc3gnO1xuXG5pbXBvcnQgeyBnZXRDb2x1bW5zLCBjb252ZXJ0QXJyYXlCdWZmZXJUb1N0cmluZywgY29udmVydFZhbHVlVHlwZSB9IGZyb20gJy4vZXhjZWwudXRpbHMnO1xuaW1wb3J0IGV4cG9ydFNoZWV0cyBmcm9tICcuL3N0eWxlZC1leGNlbC1leHBvcnQnO1xuXG5jbGFzcyBFeGNlbCB7XG4gIGNyZWF0ZVdvcmtzaGVldCA9IChkYXRhLCBjb2x1bW5zLCBkaWdpdHMpID0+IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlcnNjb3JlLWRhbmdsZSAqL1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjFdID0gJzAuMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2Ml0gPSAnMC4wMDAnO1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjNdID0gJzAuMDAwMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2NF0gPSAnMC4wMDAwMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2NV0gPSAnMC4wMDAwMDAnO1xuICAgIGNvbnN0IHNoZWV0ID0ge307XG4gICAgY29uc3Qgc2hlZXRDb2x1bW5zID0gW107XG4gICAgbGV0IGNlbGxSZWYgPSB7fTtcbiAgICBjb25zdCByYW5nZSA9IHsgczogeyBjOiAwLCByOiAwIH0sIGU6IHsgYzogY29sdW1ucy5sZW5ndGggLSAxLCByOiBkYXRhLnNpemUgfSB9O1xuICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBjb2xJbmRleCkgPT4ge1xuICAgICAgY2VsbFJlZiA9IFhMU1gudXRpbHMuZW5jb2RlX2NlbGwoeyBjOiBjb2xJbmRleCwgcjogMCB9KTtcbiAgICAgIGNvbnN0IGhlYWRlciA9IGNvbC5oZWFkZXJUZXh0ID8gU3RyaW5nKGNvbC5oZWFkZXJUZXh0KSA6IFN0cmluZyhjb2wuaGVhZGVyKTtcbiAgICAgIHNoZWV0W2NlbGxSZWZdID0geyB0OiAncycsIHY6IGhlYWRlciB9O1xuICAgICAgc2hlZXRDb2x1bW5zLnB1c2goeyB3cHg6IGNvbC53aWR0aCB9KTtcbiAgICB9KTtcbiAgICBkYXRhLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBjb2xJbmRleCkgPT4ge1xuICAgICAgICBsZXQgY2VsbERhdGEgPSBjb2wudmFsdWVLZXlQYXRoID8gcm93LmdldEluKGNvbC52YWx1ZUtleVBhdGgpIDogJyc7XG4gICAgICAgIGlmIChjb2wudmFsdWVSZW5kZXIgIT09IHVuZGVmaW5lZCAmJiAhY29sLmRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwpIHtcbiAgICAgICAgICBjZWxsRGF0YSA9IFN0cmluZyhjb2wudmFsdWVSZW5kZXIocm93KSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbC52YWx1ZVR5cGVFeGNlbCkge1xuICAgICAgICAgIGNlbGxEYXRhID0gY29udmVydFZhbHVlVHlwZShjZWxsRGF0YSwgY29sLnZhbHVlVHlwZUV4Y2VsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2VsbERhdGEgPT09IG51bGwgfHwgY2VsbERhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNlbGxEYXRhID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2VsbCA9IHsgdjogY2VsbERhdGEgfTtcbiAgICAgICAgY2VsbFJlZiA9IFhMU1gudXRpbHMuZW5jb2RlX2NlbGwoeyBjOiBjb2xJbmRleCwgcjogcm93SW5kZXggKyAxIH0pO1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwudiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBjZWxsLnQgPSAnbic7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGlnaXRzKSAmJiBOdW1iZXIoZGlnaXRzW3Jvd0luZGV4XVtjb2wudmFsdWVLZXlQYXRoLmpvaW4oJy8nKV0pID4gLTEpIHtcbiAgICAgICAgICAgIGNlbGwueiA9IE51bWJlcihYTFNYLlNTRi5fdGFibGVbMl0pLnRvRml4ZWQoZGlnaXRzW3Jvd0luZGV4XVtjb2wudmFsdWVLZXlQYXRoLmpvaW4oJy8nKV0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGRpZ2l0cykgPiAtMSkge1xuICAgICAgICAgICAgY2VsbC56ID0gTnVtYmVyKFhMU1guU1NGLl90YWJsZVsyXSkudG9GaXhlZChkaWdpdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbC52ID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBjZWxsLnQgPSAnYic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2VsbC50ID0gJ3MnO1xuICAgICAgICAgIGNlbGwueiA9ICdAJztcbiAgICAgICAgfVxuICAgICAgICBzaGVldFtjZWxsUmVmXSA9IGNlbGw7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBzaGVldFsnIWNvbHMnXSA9IHNoZWV0Q29sdW1ucztcbiAgICBzaGVldFsnIXJlZiddID0gWExTWC51dGlscy5lbmNvZGVfcmFuZ2UocmFuZ2UpO1xuICAgIHJldHVybiBzaGVldDtcbiAgfTtcblxuICAvKipcbiAgICAqIEV4cG9ydCBkYXRhIHRvIEV4Y2VsXG4gICAgKiBJbnB1dDpcbiAgICAqIGRhdGEgOjogbGlzdCwgZGVmaW5lcyBkYXRhIHRvIGV4cG9ydCxcbiAgICAqIGNvbHVtbnMgOjogYXJyYXksIGRlZmluZXMgYW4gYXJyYXkgb2YgY29sdW1uIG9iamVjdHMgd2l0aCB0aGUga2V5czpcbiAgICAqIHtcbiAgICAqICBoZWFkZXIgOjogc3RyaW5nIG9yIGVsZW1lbnQsIGRlZmluZXMgdGhlIGNvbHVtbiBuYW1lLFxuICAgICogIHZhbHVlS2V5UGF0aCA6OiBhcnJheSBvZiBzdHJpbmdzLCBkZWZpbmVzIHRoZSBjb2x1bW4gaWQsXG4gICAgKiAgd2lkdGggOjogbnVtYmVyLCB3aWR0aCBpbiBwaXhlbHMsXG4gICAgKiAgZGlzYWJsZVZhbHVlUmVuZGVySW5FeGNlbCA6OiBib29sIChvcHRpb25hbCksIGRpc2FibGUgdmFsdWVSZW5kZXIgY2FsbGJhY2sgZm9yIGV4cG9ydFxuICAgICogICB0byBFeGNlbCwgaW5zdGVhZCBleHBvcnQgdmFsdWUgZGlyZWN0bHksXG4gICAgKiAgaGVhZGVyVGV4dCA6OiBzdHJpbmcgKG9wdGlvbmFsKSwgbmVlZGVkIGlmICdoZWFkZXInIGlzIG5vdCBhIHRleHQsXG4gICAgKiAgdmFsdWVSZW5kZXIgOjogZnVuY3Rpb24gKG9wdGlvbmFsKSwgZGVmaW5lcyBhIHJlbmRlciBmdW5jdGlvbixcbiAgICAqICB2YWx1ZVR5cGVFeGNlbCA6OiBzdHJpbmcgKG9wdGlvbmFsKSwgZGVmaW5lcyBhIHZhbHVlIHR5cGUgZm9yIEV4Y2VsIGlmIGRpZmZlcnMgZnJvbSBVSVxuICAgICogfSxcbiAgICAqIGZpbGVOYW1lIDo6IHN0cmluZyAob3B0aW9uYWwpLCBkZWZpbmVzIGEgZmlsZSBuYW1lLFxuICAgICogZGlnaXRzIDo6IFtudW1iZXIsIGFycmF5XSAob3B0aW9uYWwpLCBkZWZpbmVzIGEgbnVtYmVyIG9mIGRpZ2l0cyBmb3IgZGVjaW1hbHMgaW4gYWxsIHRhYmxlXG4gICAgKiAgIG9yIGFuIGFycmF5IGNvbnRhaW5pbmcgZGlnaXRzIGZvciBjZWxscyxcbiAgICAqIHZpc2libGVDb2x1bW5zIDo6IGxpc3QgKG9wdGlvbmFsKSwgZGVmaW5lcyB2aXNpYmxlIGNvbHVtbnMgaW4gY2FzZSBjb2x1bW4gc2V0dGluZ3MgYXJlIHVzZWQuXG4gICAgKi9cbiAgZXhwb3J0VG9FeGNlbCA9IChkYXRhLCBjb2x1bW5zLCBmaWxlTmFtZSA9ICdFeHBvcnQgRnJvbSBPQycsIGRpZ2l0cyA9IG51bGwsIHZpc2libGVDb2x1bW5zID0gbnVsbCkgPT4ge1xuICAgIGNvbnN0IHNoZWV0TmFtZSA9ICdTaGVldDEnO1xuICAgIGNvbnN0IGV4cG9ydGVkQ29sdW1ucyA9IGdldENvbHVtbnMoY29sdW1ucywgdmlzaWJsZUNvbHVtbnMpO1xuICAgIGNvbnN0IHNoZWV0ID0gdGhpcy5jcmVhdGVXb3Jrc2hlZXQoZGF0YSwgZXhwb3J0ZWRDb2x1bW5zLCBkaWdpdHMpO1xuICAgIGNvbnN0IGJvb2sgPSB7IFNoZWV0TmFtZXM6IFtzaGVldE5hbWVdLCBTaGVldHM6IHt9IH07XG4gICAgYm9vay5TaGVldHNbc2hlZXROYW1lXSA9IHNoZWV0O1xuICAgIFhMU1gud3JpdGVGaWxlKGJvb2ssIGAke2ZpbGVOYW1lfS54bHN4YCwgeyBib29rVHlwZTogJ3hsc3gnLCBib29rU1NUOiB0cnVlLCB0eXBlOiAnYmluYXJ5JyB9KTtcbiAgfTtcblxuICBleHBvcnRTaGVldHNUb0V4Y2VsID0gKHNoZWV0cywgZmlsZU5hbWUpID0+IHtcbiAgICBleHBvcnRTaGVldHMoc2hlZXRzLCBmaWxlTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogSW1wb3J0IGRhdGEgZnJvbSBFeGNlbFxuICAgKiBJbnB1dDpcbiAgICogZmlsZXMgOjogZXZlbnQudGFyZ2V0LmZpbGVzIGFycmF5LFxuICAgKiBjYWxsYmFjayA6OiBmdW5jdGlvbiwgb25Mb2FkIGNhbGxiYWNrLlxuICAgKi9cbiAgaW1wb3J0RnJvbUV4Y2VsID0gKGZpbGVzLCBjYWxsYmFjaykgPT4ge1xuICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGZpbGVzWzBdLnR5cGUgIT09ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICByZWFkZXIub25sb2FkID0gY2FsbGJhY2s7XG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGZpbGVzWzBdKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGJhY2sgb24gbG9hZCBvZiBGaWxlUmVhZGVyIGZvciBpbXBvcnQgb3BlcmF0aW9uXG4gICAqIElucHV0OlxuICAgKiBlIDo6IGV2ZW50IG9iamVjdCxcbiAgICogY29sdW1ucyA6OiBhcnJheSwgZGVmaW5lcyBjb2x1bW4gb2JqZWN0cyB3aXRoIHRoZSBrZXlzOlxuICAgKiB7XG4gICAqICB2YWx1ZUtleVBhdGggOjogYXJyYXkgb2Ygc3RyaW5ncywgZGVmaW5lcyB0aGUgY29sdW1uIGlkLFxuICAgKiAgdmFsdWVFeGNlbE1hdGNoIDo6IGZ1bmN0aW9uIChvcHRpb25hbCksIGNhbGxiYWNrIHRvIHVwZGF0ZSB0aGUgdmFsdWUgaW4gaW1wb3J0ZWQgZGF0YSxcbiAgICogIGRlZmF1bHRWYWx1ZSA6OiBhbnkgKG9wdGlvbmFsKSwgZGVmaW5lcyBhIGRlZmF1bHQgdmFsdWVcbiAgICogfSxcbiAgICogdmlzaWJsZUNvbHVtbnMgOjogbGlzdCAob3B0aW9uYWwpLCBkZWZpbmVzIHZpc2libGUgY29sdW1ucyBpbiBjYXNlIGNvbHVtbiBzZXR0aW5ncyBpcyB1c2VkLlxuICAgKiBPdXRwdXQ6XG4gICAqIGFycmF5IG9mIGltcG9ydGVkIGRhdGEuXG4gICAqL1xuICBvbkxvYWRDYWxsYmFjayA9IChlLCBjb2x1bW5zLCB2aXNpYmxlQ29sdW1ucyA9IG51bGwpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBjb252ZXJ0QXJyYXlCdWZmZXJUb1N0cmluZyhlLnRhcmdldC5yZXN1bHQpO1xuICAgIGNvbnN0IGJvb2sgPSBYTFNYLnJlYWQoYnRvYShyZXN1bHQpLCB7IHR5cGU6ICdiYXNlNjQnIH0pO1xuICAgIGNvbnN0IHJhd0RhdGEgPSBYTFNYLnV0aWxzXG4gICAgICAuc2hlZXRfdG9fanNvbihib29rLlNoZWV0c1tib29rLlNoZWV0TmFtZXNbMF1dLCB7IGhlYWRlcjogMSwgcmF3OiB0cnVlIH0pO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJhd0RhdGEpICYmIHJhd0RhdGEubGVuZ3RoIDwgMikge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBsZXQgaW1wb3J0ZWRDb2x1bW5zO1xuICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICByYXdEYXRhLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICAgIGlmIChyb3dJbmRleCA9PT0gMCkge1xuICAgICAgICBpbXBvcnRlZENvbHVtbnMgPSB0eXBlb2YgY29sdW1ucyA9PT0gJ2Z1bmN0aW9uJyA/IGdldENvbHVtbnMoY29sdW1ucyhyb3cpLCB2aXNpYmxlQ29sdW1ucykgOiBnZXRDb2x1bW5zKGNvbHVtbnMsIHZpc2libGVDb2x1bW5zKTtcbiAgICAgIH1cbiAgICAgIGlmIChyb3dJbmRleCA+PSAxKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB7fTtcbiAgICAgICAgcm93LmZvckVhY2goKGNlbGwsIGNlbGxJbmRleCkgPT4ge1xuICAgICAgICAgIGlmIChjZWxsSW5kZXggPCBpbXBvcnRlZENvbHVtbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGltcG9ydGVkQ29sdW1uc1tjZWxsSW5kZXhdLnZhbHVlRXhjZWxNYXRjaCAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgID8gaW1wb3J0ZWRDb2x1bW5zW2NlbGxJbmRleF0udmFsdWVFeGNlbE1hdGNoKGNlbGwpIDogY2VsbDtcbiAgICAgICAgICAgIGl0ZW1baW1wb3J0ZWRDb2x1bW5zW2NlbGxJbmRleF0udmFsdWVLZXlQYXRoWzBdXSA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGltcG9ydGVkQ29sdW1ucy5mb3JFYWNoKChjb2x1bW4pID0+IHtcbiAgICAgICAgICBpZiAoY29sdW1uLmRlZmF1bHRWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIGl0ZW1bY29sdW1uLnZhbHVlS2V5UGF0aFswXV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaXRlbVtjb2x1bW4udmFsdWVLZXlQYXRoWzBdXSA9IGNvbHVtbi5kZWZhdWx0VmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZGF0YS5wdXNoKGl0ZW0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBFeGNlbCgpO1xuIl19