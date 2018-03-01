function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import XLSX from 'xlsx';

import { getColumns, convertArrayBufferToString, convertValueType } from './excel.utils';

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

export default new Excel();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leGNlbC5qcyJdLCJuYW1lcyI6WyJYTFNYIiwiZ2V0Q29sdW1ucyIsImNvbnZlcnRBcnJheUJ1ZmZlclRvU3RyaW5nIiwiY29udmVydFZhbHVlVHlwZSIsIkV4Y2VsIiwiY3JlYXRlV29ya3NoZWV0IiwiZGF0YSIsImNvbHVtbnMiLCJkaWdpdHMiLCJTU0YiLCJfdGFibGUiLCJzaGVldCIsInNoZWV0Q29sdW1ucyIsImNlbGxSZWYiLCJyYW5nZSIsInMiLCJjIiwiciIsImUiLCJsZW5ndGgiLCJzaXplIiwiZm9yRWFjaCIsImNvbCIsImNvbEluZGV4IiwidXRpbHMiLCJlbmNvZGVfY2VsbCIsImhlYWRlciIsImhlYWRlclRleHQiLCJTdHJpbmciLCJ0IiwidiIsInB1c2giLCJ3cHgiLCJ3aWR0aCIsInJvdyIsInJvd0luZGV4IiwiY2VsbERhdGEiLCJ2YWx1ZUtleVBhdGgiLCJnZXRJbiIsInZhbHVlUmVuZGVyIiwidW5kZWZpbmVkIiwiZGlzYWJsZVZhbHVlUmVuZGVySW5FeGNlbCIsInZhbHVlVHlwZUV4Y2VsIiwiY2VsbCIsIkFycmF5IiwiaXNBcnJheSIsIk51bWJlciIsImpvaW4iLCJ6IiwidG9GaXhlZCIsImVuY29kZV9yYW5nZSIsImV4cG9ydFRvRXhjZWwiLCJmaWxlTmFtZSIsInZpc2libGVDb2x1bW5zIiwic2hlZXROYW1lIiwiZXhwb3J0ZWRDb2x1bW5zIiwiYm9vayIsIlNoZWV0TmFtZXMiLCJTaGVldHMiLCJ3cml0ZUZpbGUiLCJib29rVHlwZSIsImJvb2tTU1QiLCJ0eXBlIiwiaW1wb3J0RnJvbUV4Y2VsIiwiZmlsZXMiLCJjYWxsYmFjayIsImFsZXJ0Q2FsbGJhY2siLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwicmVhZEFzQXJyYXlCdWZmZXIiLCJvbkxvYWRDYWxsYmFjayIsInJlc3VsdCIsInRhcmdldCIsInJlYWQiLCJidG9hIiwicmF3RGF0YSIsInNoZWV0X3RvX2pzb24iLCJyYXciLCJpbXBvcnRlZENvbHVtbnMiLCJpdGVtIiwiY2VsbEluZGV4IiwidmFsdWUiLCJ2YWx1ZUV4Y2VsTWF0Y2giLCJjb2x1bW4iLCJkZWZhdWx0VmFsdWUiXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBT0EsSUFBUCxNQUFpQixNQUFqQjs7QUFFQSxTQUNFQyxVQURGLEVBRUVDLDBCQUZGLEVBR0VDLGdCQUhGLFFBSU8sZUFKUDs7SUFNTUMsSzs7Ozs7T0FDSkMsZSxHQUFrQixVQUFDQyxJQUFELEVBQU9DLE9BQVAsRUFBZ0JDLE1BQWhCLEVBQTJCO0FBQzNDO0FBQ0FSLFNBQUtTLEdBQUwsQ0FBU0MsTUFBVCxDQUFnQixHQUFoQixJQUF1QixLQUF2QjtBQUNBVixTQUFLUyxHQUFMLENBQVNDLE1BQVQsQ0FBZ0IsR0FBaEIsSUFBdUIsT0FBdkI7QUFDQVYsU0FBS1MsR0FBTCxDQUFTQyxNQUFULENBQWdCLEdBQWhCLElBQXVCLFFBQXZCO0FBQ0FWLFNBQUtTLEdBQUwsQ0FBU0MsTUFBVCxDQUFnQixHQUFoQixJQUF1QixTQUF2QjtBQUNBVixTQUFLUyxHQUFMLENBQVNDLE1BQVQsQ0FBZ0IsR0FBaEIsSUFBdUIsVUFBdkI7QUFDQSxRQUFNQyxRQUFRLEVBQWQ7QUFDQSxRQUFNQyxlQUFlLEVBQXJCO0FBQ0EsUUFBSUMsVUFBVSxFQUFkO0FBQ0EsUUFBTUMsUUFBUSxFQUFFQyxHQUFHLEVBQUVDLEdBQUcsQ0FBTCxFQUFRQyxHQUFHLENBQVgsRUFBTCxFQUFxQkMsR0FBRyxFQUFFRixHQUFHVCxRQUFRWSxNQUFSLEdBQWlCLENBQXRCLEVBQXlCRixHQUFHWCxLQUFLYyxJQUFqQyxFQUF4QixFQUFkO0FBQ0FiLFlBQVFjLE9BQVIsQ0FBZ0IsVUFBQ0MsR0FBRCxFQUFNQyxRQUFOLEVBQW1CO0FBQ2pDVixnQkFBVWIsS0FBS3dCLEtBQUwsQ0FBV0MsV0FBWCxDQUF1QixFQUFFVCxHQUFHTyxRQUFMLEVBQWVOLEdBQUcsQ0FBbEIsRUFBdkIsQ0FBVjtBQUNBLFVBQU1TLFNBQVNKLElBQUlLLFVBQUosR0FBaUJDLE9BQU9OLElB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K0IrQyxPQUFPQyxZQUF0QztBQUNEO0FBQ0YsU0FKRDtBQUtBL0UsYUFBS3lCLElBQUwsQ0FBVWlELElBQVY7QUFDRDtBQUNGLEtBbEJEO0FBbUJBLFdBQU8xRSxJQUFQO0FBQ0QsRzs7O0FBN0ZEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkJBOzs7Ozs7Ozs7QUFvQkE7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQ0YsZUFBZSxJQUFJRixLQUFKLEVBQWYiLCJmaWxlIjoiZXhjZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWExTWCBmcm9tICd4bHN4JztcblxuaW1wb3J0IHtcbiAgZ2V0Q29sdW1ucyxcbiAgY29udmVydEFycmF5QnVmZmVyVG9TdHJpbmcsXG4gIGNvbnZlcnRWYWx1ZVR5cGUsXG59IGZyb20gJy4vZXhjZWwudXRpbHMnO1xuXG5jbGFzcyBFeGNlbCB7XG4gIGNyZWF0ZVdvcmtzaGVldCA9IChkYXRhLCBjb2x1bW5zLCBkaWdpdHMpID0+IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlcnNjb3JlLWRhbmdsZSAqL1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjFdID0gJzAuMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2Ml0gPSAnMC4wMDAnO1xuICAgIFhMU1guU1NGLl90YWJsZVsxNjNdID0gJzAuMDAwMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2NF0gPSAnMC4wMDAwMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2NV0gPSAnMC4wMDAwMDAnO1xuICAgIGNvbnN0IHNoZWV0ID0ge307XG4gICAgY29uc3Qgc2hlZXRDb2x1bW5zID0gW107XG4gICAgbGV0IGNlbGxSZWYgPSB7fTtcbiAgICBjb25zdCByYW5nZSA9IHsgczogeyBjOiAwLCByOiAwIH0sIGU6IHsgYzogY29sdW1ucy5sZW5ndGggLSAxLCByOiBkYXRhLnNpemUgfSB9O1xuICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBjb2xJbmRleCkgPT4ge1xuICAgICAgY2VsbFJlZiA9IFhMU1gudXRpbHMuZW5jb2RlX2NlbGwoeyBjOiBjb2xJbmRleCwgcjogMCB9KTtcbiAgICAgIGNvbnN0IGhlYWRlciA9IGNvbC5oZWFkZXJUZXh0ID8gU3RyaW5nKGNvbC5oZWFkZXJUZXh0KSA6IFN0cmluZyhjb2wuaGVhZGVyKTtcbiAgICAgIHNoZWV0W2NlbGxSZWZdID0geyB0OiAncycsIHY6IGhlYWRlciB9O1xuICAgICAgc2hlZXRDb2x1bW5zLnB1c2goeyB3cHg6IGNvbC53aWR0aCB9KTtcbiAgICB9KTtcbiAgICBkYXRhLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBjb2xJbmRleCkgPT4ge1xuICAgICAgICBsZXQgY2VsbERhdGEgPSBjb2wudmFsdWVLZXlQYXRoID8gcm93LmdldEluKGNvbC52YWx1ZUtleVBhdGgpIDogJyc7XG4gICAgICAgIGlmIChjb2wudmFsdWVSZW5kZXIgIT09IHVuZGVmaW5lZCAmJiAhY29sLmRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwpIHtcbiAgICAgICAgICBjZWxsRGF0YSA9IFN0cmluZyhjb2wudmFsdWVSZW5kZXIocm93KSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbC52YWx1ZVR5cGVFeGNlbCkge1xuICAgICAgICAgIGNlbGxEYXRhID0gY29udmVydFZhbHVlVHlwZShjZWxsRGF0YSwgY29sLnZhbHVlVHlwZUV4Y2VsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2VsbERhdGEgPT09IG51bGwgfHwgY2VsbERhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNlbGxEYXRhID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2VsbCA9IHsgdjogY2VsbERhdGEgfTtcbiAgICAgICAgY2VsbFJlZiA9IFhMU1gudXRpbHMuZW5jb2RlX2NlbGwoeyBjOiBjb2xJbmRleCwgcjogcm93SW5kZXggKyAxIH0pO1xuICAgICAgICBpZiAodHlwZW9mIGNlbGwudiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBjZWxsLnQgPSAnbic7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGlnaXRzKSAmJiBOdW1iZXIoZGlnaXRzW3Jvd0luZGV4XVtjb2wudmFsdWVLZXlQYXRoLmpvaW4oJy8nKV0pID4gLTEpIHtcbiAgICAgICAgICAgIGNlbGwueiA9IE51bWJlcihYTFNYLlNTRi5fdGFibGVbMl0pLnRvRml4ZWQoZGlnaXRzW3Jvd0luZGV4XVtjb2wudmFsdWVLZXlQYXRoLmpvaW4oJy8nKV0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGRpZ2l0cykgPiAtMSkge1xuICAgICAgICAgICAgY2VsbC56ID0gTnVtYmVyKFhMU1guU1NGLl90YWJsZVsyXSkudG9GaXhlZChkaWdpdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbC52ID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBjZWxsLnQgPSAnYic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2VsbC50ID0gJ3MnO1xuICAgICAgICB9XG4gICAgICAgIHNoZWV0W2NlbGxSZWZdID0gY2VsbDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHNoZWV0WychY29scyddID0gc2hlZXRDb2x1bW5zO1xuICAgIHNoZWV0WychcmVmJ10gPSBYTFNYLnV0aWxzLmVuY29kZV9yYW5nZShyYW5nZSk7XG4gICAgcmV0dXJuIHNoZWV0O1xuICB9O1xuXG4gIC8qKlxuICAgICogRXhwb3J0IGRhdGEgdG8gRXhjZWxcbiAgICAqIElucHV0OlxuICAgICogZGF0YSBpcyBhIExpc3Qgb2YgZGF0YSB0byBleHBvcnQsXG4gICAgKiBjb2x1bW5zIGlzIGFuIGFycmF5IG9mIGNvbHVtbiBvYmplY3RzIHdpdGggdGhlIGtleXM6XG4gICAgKiB7XG4gICAgKiAgaGVhZGVyIDo6IHN0cmluZyBvciBlbGVtZW50LCBkZWZpbmVzIHRoZSBjb2x1bW4gbmFtZSxcbiAgICAqICB2YWx1ZUtleVBhdGggOjogYXJyYXkgb2Ygc3RyaW5ncywgZGVmaW5lcyB0aGUgY29sdW1uIGlkLFxuICAgICogIHdpZHRoIDo6IG51bWJlciwgd2lkdGggaW4gcGl4ZWxzLFxuICAgICogIGRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwgOjogYm9vbCAob3B0aW9uYWwpLCBkaXNhYmxlIHZhbHVlUmVuZGVyIGNhbGxiYWNrIGZvciBleHBvcnRcbiAgICAqICAgdG8gRXhjZWwsIGluc3RlYWQgZXhwb3J0IHZhbHVlIGRpcmVjdGx5LFxuICAgICogIGhlYWRlclRleHQgOjogc3RyaW5nIChvcHRpb25hbCksIG5lZWRlZCBpZiAnaGVhZGVyJyBpcyBub3QgYSB0ZXh0LFxuICAgICogIHZhbHVlUmVuZGVyIDo6IGZ1bmN0aW9uIChvcHRpb25hbCksIGRlZmluZXMgYSByZW5kZXIgZnVuY3Rpb24sXG4gICAgKiAgdmFsdWVUeXBlRXhjZWwgOjogc3RyaW5nIChvcHRpb25hbCksIGRlZmluZXMgYSB2YWx1ZSB0eXBlIGZvciBFeGNlbCBpZiBkaWZmZXJzIGZyb20gVUlcbiAgICAqIH0sXG4gICAgKiBmaWxlTmFtZSBpcyBhIGZpbGUgbmFtZSBzdHJpbmcgKG9wdGlvbmFsKSxcbiAgICAqIGRpZ2l0cyBpcyBhIG51bWJlciBvZiBkaWdpdHMgZm9yIGRlY2ltYWxzIGluIGFsbCB0YWJsZSBvciBhbiBhcnJheSBjb250YWluaW5nIGRpZ2l0c1xuICAgICogICBmb3IgY2VsbHMgKG9wdGlvbmFsKSxcbiAgICAqIHZpc2libGVDb2x1bW5zIGlzIGEgbGlzdCBvZiB2aXNpYmxlIGNvbHVtbnMgaW4gY2FzZSBjb2x1bW4gc2V0dGluZ3MgaXMgdXNlZCAob3B0aW9uYWwpLlxuICAgICovXG4gIGV4cG9ydFRvRXhjZWwgPSAoZGF0YSwgY29sdW1ucywgZmlsZU5hbWUgPSAnRXhwb3J0IEZyb20gT0MnLCBkaWdpdHMgPSBudWxsLCB2aXNpYmxlQ29sdW1ucyA9IG51bGwpID0+IHtcbiAgICBjb25zdCBzaGVldE5hbWUgPSAnU2hlZXQxJztcbiAgICBjb25zdCBleHBvcnRlZENvbHVtbnMgPSBnZXRDb2x1bW5zKGNvbHVtbnMsIHZpc2libGVDb2x1bW5zKTtcbiAgICBjb25zdCBzaGVldCA9IHRoaXMuY3JlYXRlV29ya3NoZWV0KGRhdGEsIGV4cG9ydGVkQ29sdW1ucywgZGlnaXRzKTtcbiAgICBjb25zdCBib29rID0geyBTaGVldE5hbWVzOiBbc2hlZXROYW1lXSwgU2hlZXRzOiB7fSB9O1xuICAgIGJvb2suU2hlZXRzW3NoZWV0TmFtZV0gPSBzaGVldDtcbiAgICBYTFNYLndyaXRlRmlsZShib29rLCBgJHtmaWxlTmFtZX0ueGxzeGAsIHsgYm9va1R5cGU6ICd4bHN4JywgYm9va1NTVDogdHJ1ZSwgdHlwZTogJ2JpbmFyeScgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEltcG9ydCBkYXRhIGZyb20gRXhjZWxcbiAgICogSW5wdXQ6XG4gICAqIGZpbGVzIGlzIGFuIGV2ZW50LnRhcmdldC5maWxlcyBhcnJheSxcbiAgICogY2FsbGJhY2sgaXMgb25Mb2FkIGNhbGxiYWNrIGNhbGxlZCBmcm9tIGEgcGFyZW50IGNvbXBvbmVudCxcbiAgICogYWxlcnRDYWxsYmFjayBpcyBhIGNhbGxiYWNrIGZvciBlcnJvciBhbGVydCAob3B0aW9uYWwpLlxuICAgKi9cbiAgaW1wb3J0RnJvbUV4Y2VsID0gKGZpbGVzLCBjYWxsYmFjaywgYWxlcnRDYWxsYmFjayA9IG51bGwpID0+IHtcbiAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChhbGVydENhbGxiYWNrICYmIGZpbGVzWzBdLnR5cGUgIT09ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldCcpIHtcbiAgICAgIGFsZXJ0Q2FsbGJhY2soKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICByZWFkZXIub25sb2FkID0gY2FsbGJhY2s7XG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGZpbGVzWzBdKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGJhY2sgb24gbG9hZCBvZiBGaWxlUmVhZGVyIGZvciBpbXBvcnQgb3BlcmF0aW9uXG4gICAqIElucHV0OlxuICAgKiBlIGlzIGFuIGV2ZW50IG9iamVjdCxcbiAgICogY29sdW1ucyBpcyBhbiBhcnJheSBvZiBjb2x1bW4gb2JqZWN0cyB3aXRoIHRoZSBrZXlzOlxuICAgKiB7XG4gICAqICB2YWx1ZUtleVBhdGggOjogYXJyYXkgb2Ygc3RyaW5ncyxcbiAgICogIHZhbHVlRXhjZWxNYXRjaCA6OiBmdW5jdGlvbiAob3B0aW9uYWwpLFxuICAgKiAgZGVmYXVsdFZhbHVlIDo6IGFueSxcbiAgICogfSxcbiAgICogdmlzaWJsZUNvbHVtbnMgaXMgYSBsaXN0IG9mIHZpc2libGUgY29sdW1ucyBpbiBjYXNlIGNvbHVtbiBzZXR0aW5ncyBpcyB1c2VkIChvcHRpb25hbCkuXG4gICAqIE91dHB1dDpcbiAgICogYW4gYXJyYXkgb2YgZGF0YS5cbiAgICovXG4gIG9uTG9hZENhbGxiYWNrID0gKGUsIGNvbHVtbnMsIHZpc2libGVDb2x1bW5zID0gbnVsbCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGNvbnZlcnRBcnJheUJ1ZmZlclRvU3RyaW5nKGUudGFyZ2V0LnJlc3VsdCk7XG4gICAgY29uc3QgYm9vayA9IFhMU1gucmVhZChidG9hKHJlc3VsdCksIHsgdHlwZTogJ2Jhc2U2NCcgfSk7XG4gICAgY29uc3QgcmF3RGF0YSA9XG4gICAgICBYTFNYLnV0aWxzLnNoZWV0X3RvX2pzb24oYm9vay5TaGVldHNbYm9vay5TaGVldE5hbWVzWzBdXSwgeyBoZWFkZXI6IDEsIHJhdzogdHJ1ZSB9KTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyYXdEYXRhKSAmJiByYXdEYXRhLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgaW1wb3J0ZWRDb2x1bW5zID0gZ2V0Q29sdW1ucyhjb2x1bW5zLCB2aXNpYmxlQ29sdW1ucyk7XG4gICAgY29uc3QgZGF0YSA9IFtdO1xuICAgIHJhd0RhdGEuZm9yRWFjaCgocm93LCByb3dJbmRleCkgPT4ge1xuICAgICAgLy8gc2tpcCB0aGUgaGVhZGVyXG4gICAgICBpZiAocm93SW5kZXggPj0gMSkge1xuICAgICAgICBjb25zdCBpdGVtID0ge307XG4gICAgICAgIHJvdy5mb3JFYWNoKChjZWxsLCBjZWxsSW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAoY2VsbEluZGV4IDwgaW1wb3J0ZWRDb2x1bW5zLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBpbXBvcnRlZENvbHVtbnNbY2VsbEluZGV4XS52YWx1ZUV4Y2VsTWF0Y2ggIT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgICAgIGltcG9ydGVkQ29sdW1uc1tjZWxsSW5kZXhdLnZhbHVlRXhjZWxNYXRjaChjZWxsKSA6IGNlbGw7XG4gICAgICAgICAgICBpdGVtW2ltcG9ydGVkQ29sdW1uc1tjZWxsSW5kZXhdLnZhbHVlS2V5UGF0aFswXV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpbXBvcnRlZENvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG4gICAgICAgICAgaWYgKGNvbHVtbi5kZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCAmJiBpdGVtW2NvbHVtbi52YWx1ZUtleVBhdGhbMF1dID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGl0ZW1bY29sdW1uLnZhbHVlS2V5UGF0aFswXV0gPSBjb2x1bW4uZGVmYXVsdFZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRhdGEucHVzaChpdGVtKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgRXhjZWwoKTtcbiJdfQ==