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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leGNlbC5qcyJdLCJuYW1lcyI6WyJYTFNYIiwiZ2V0Q29sdW1ucyIsImNvbnZlcnRBcnJheUJ1ZmZlclRvU3RyaW5nIiwiY29udmVydFZhbHVlVHlwZSIsIkV4Y2VsIiwiY3JlYXRlV29ya3NoZWV0IiwiZGF0YSIsImNvbHVtbnMiLCJkaWdpdHMiLCJTU0YiLCJfdGFibGUiLCJzaGVldCIsInNoZWV0Q29sdW1ucyIsImNlbGxSZWYiLCJyYW5nZSIsInMiLCJjIiwiciIsImUiLCJsZW5ndGgiLCJzaXplIiwiZm9yRWFjaCIsImNvbCIsImNvbEluZGV4IiwidXRpbHMiLCJlbmNvZGVfY2VsbCIsImhlYWRlciIsImhlYWRlclRleHQiLCJTdHJpbmciLCJ0IiwidiIsInB1c2giLCJ3cHgiLCJ3aWR0aCIsInJvdyIsInJvd0luZGV4IiwiY2VsbERhdGEiLCJ2YWx1ZUtleVBhdGgiLCJnZXRJbiIsInZhbHVlUmVuZGVyIiwidW5kZWZpbmVkIiwiZGlzYWJsZVZhbHVlUmVuZGVySW5FeGNlbCIsInZhbHVlVHlwZUV4Y2VsIiwiY2VsbCIsIkFycmF5IiwiaXNBcnJheSIsIk51bWJlciIsImpvaW4iLCJ6IiwidG9GaXhlZCIsImVuY29kZV9yYW5nZSIsImV4cG9ydFRvRXhjZWwiLCJmaWxlTmFtZSIsInZpc2libGVDb2x1bW5zIiwic2hlZXROYW1lIiwiZXhwb3J0ZWRDb2x1bW5zIiwiYm9vayIsIlNoZWV0TmFtZXMiLCJTaGVldHMiLCJ3cml0ZUZpbGUiLCJib29rVHlwZSIsImJvb2tTU1QiLCJ0eXBlIiwiaW1wb3J0RnJvbUV4Y2VsIiwiZmlsZXMiLCJjYWxsYmFjayIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJyZWFkQXNBcnJheUJ1ZmZlciIsIm9uTG9hZENhbGxiYWNrIiwicmVzdWx0IiwidGFyZ2V0IiwicmVhZCIsImJ0b2EiLCJyYXdEYXRhIiwic2hlZXRfdG9fanNvbiIsInJhdyIsImltcG9ydGVkQ29sdW1ucyIsIml0ZW0i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Z0QsSUFBVjtBQUNEO0FBQ0YsS0FsQkQ7QUFtQkEsV0FBT3pFLElBQVA7QUFDRCxHOzs7QUEzRkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE2QkE7Ozs7Ozs7O0FBa0JBOzs7Ozs7Ozs7Ozs7Ozs7O0FBK0NGLGVBQWUsSUFBSUYsS0FBSixFQUFmIiwiZmlsZSI6ImV4Y2VsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhMU1ggZnJvbSAneGxzeCc7XG5cbmltcG9ydCB7IGdldENvbHVtbnMsIGNvbnZlcnRBcnJheUJ1ZmZlclRvU3RyaW5nLCBjb252ZXJ0VmFsdWVUeXBlIH0gZnJvbSAnLi9leGNlbC51dGlscyc7XG5cbmNsYXNzIEV4Y2VsIHtcbiAgY3JlYXRlV29ya3NoZWV0ID0gKGRhdGEsIGNvbHVtbnMsIGRpZ2l0cykgPT4ge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVyc2NvcmUtZGFuZ2xlICovXG4gICAgWExTWC5TU0YuX3RhYmxlWzE2MV0gPSAnMC4wJztcbiAgICBYTFNYLlNTRi5fdGFibGVbMTYyXSA9ICcwLjAwMCc7XG4gICAgWExTWC5TU0YuX3RhYmxlWzE2M10gPSAnMC4wMDAwJztcbiAgICBYTFNYLlNTRi5fdGFibGVbMTY0XSA9ICcwLjAwMDAwJztcbiAgICBYTFNYLlNTRi5fdGFibGVbMTY1XSA9ICcwLjAwMDAwMCc7XG4gICAgY29uc3Qgc2hlZXQgPSB7fTtcbiAgICBjb25zdCBzaGVldENvbHVtbnMgPSBbXTtcbiAgICBsZXQgY2VsbFJlZiA9IHt9O1xuICAgIGNvbnN0IHJhbmdlID0geyBzOiB7IGM6IDAsIHI6IDAgfSwgZTogeyBjOiBjb2x1bW5zLmxlbmd0aCAtIDEsIHI6IGRhdGEuc2l6ZSB9IH07XG4gICAgY29sdW1ucy5mb3JFYWNoKChjb2wsIGNvbEluZGV4KSA9PiB7XG4gICAgICBjZWxsUmVmID0gWExTWC51dGlscy5lbmNvZGVfY2VsbCh7IGM6IGNvbEluZGV4LCByOiAwIH0pO1xuICAgICAgY29uc3QgaGVhZGVyID0gY29sLmhlYWRlclRleHQgPyBTdHJpbmcoY29sLmhlYWRlclRleHQpIDogU3RyaW5nKGNvbC5oZWFkZXIpO1xuICAgICAgc2hlZXRbY2VsbFJlZl0gPSB7IHQ6ICdzJywgdjogaGVhZGVyIH07XG4gICAgICBzaGVldENvbHVtbnMucHVzaCh7IHdweDogY29sLndpZHRoIH0pO1xuICAgIH0pO1xuICAgIGRhdGEuZm9yRWFjaCgocm93LCByb3dJbmRleCkgPT4ge1xuICAgICAgY29sdW1ucy5mb3JFYWNoKChjb2wsIGNvbEluZGV4KSA9PiB7XG4gICAgICAgIGxldCBjZWxsRGF0YSA9IGNvbC52YWx1ZUtleVBhdGggPyByb3cuZ2V0SW4oY29sLnZhbHVlS2V5UGF0aCkgOiAnJztcbiAgICAgICAgaWYgKGNvbC52YWx1ZVJlbmRlciAhPT0gdW5kZWZpbmVkICYmICFjb2wuZGlzYWJsZVZhbHVlUmVuZGVySW5FeGNlbCkge1xuICAgICAgICAgIGNlbGxEYXRhID0gU3RyaW5nKGNvbC52YWx1ZVJlbmRlcihyb3cpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sLnZhbHVlVHlwZUV4Y2VsKSB7XG4gICAgICAgICAgY2VsbERhdGEgPSBjb252ZXJ0VmFsdWVUeXBlKGNlbGxEYXRhLCBjb2wudmFsdWVUeXBlRXhjZWwpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjZWxsRGF0YSA9PT0gbnVsbCB8fCBjZWxsRGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY2VsbERhdGEgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjZWxsID0geyB2OiBjZWxsRGF0YSB9O1xuICAgICAgICBjZWxsUmVmID0gWExTWC51dGlscy5lbmNvZGVfY2VsbCh7IGM6IGNvbEluZGV4LCByOiByb3dJbmRleCArIDEgfSk7XG4gICAgICAgIGlmICh0eXBlb2YgY2VsbC52ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGNlbGwudCA9ICduJztcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkaWdpdHMpICYmIE51bWJlcihkaWdpdHNbcm93SW5kZXhdW2NvbC52YWx1ZUtleVBhdGguam9pbignLycpXSkgPiAtMSkge1xuICAgICAgICAgICAgY2VsbC56ID0gTnVtYmVyKFhMU1guU1NGLl90YWJsZVsyXSkudG9GaXhlZChkaWdpdHNbcm93SW5kZXhdW2NvbC52YWx1ZUtleVBhdGguam9pbignLycpXSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChOdW1iZXIoZGlnaXRzKSA+IC0xKSB7XG4gICAgICAgICAgICBjZWxsLnogPSBOdW1iZXIoWExTWC5TU0YuX3RhYmxlWzJdKS50b0ZpeGVkKGRpZ2l0cyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZWxsLnYgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIGNlbGwudCA9ICdiJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjZWxsLnQgPSAncyc7XG4gICAgICAgIH1cbiAgICAgICAgc2hlZXRbY2VsbFJlZl0gPSBjZWxsO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgc2hlZXRbJyFjb2xzJ10gPSBzaGVldENvbHVtbnM7XG4gICAgc2hlZXRbJyFyZWYnXSA9IFhMU1gudXRpbHMuZW5jb2RlX3JhbmdlKHJhbmdlKTtcbiAgICByZXR1cm4gc2hlZXQ7XG4gIH07XG5cbiAgLyoqXG4gICAgKiBFeHBvcnQgZGF0YSB0byBFeGNlbFxuICAgICogSW5wdXQ6XG4gICAgKiBkYXRhIDo6IGxpc3QsIGRlZmluZXMgZGF0YSB0byBleHBvcnQsXG4gICAgKiBjb2x1bW5zIDo6IGFycmF5LCBkZWZpbmVzIGFuIGFycmF5IG9mIGNvbHVtbiBvYmplY3RzIHdpdGggdGhlIGtleXM6XG4gICAgKiB7XG4gICAgKiAgaGVhZGVyIDo6IHN0cmluZyBvciBlbGVtZW50LCBkZWZpbmVzIHRoZSBjb2x1bW4gbmFtZSxcbiAgICAqICB2YWx1ZUtleVBhdGggOjogYXJyYXkgb2Ygc3RyaW5ncywgZGVmaW5lcyB0aGUgY29sdW1uIGlkLFxuICAgICogIHdpZHRoIDo6IG51bWJlciwgd2lkdGggaW4gcGl4ZWxzLFxuICAgICogIGRpc2FibGVWYWx1ZVJlbmRlckluRXhjZWwgOjogYm9vbCAob3B0aW9uYWwpLCBkaXNhYmxlIHZhbHVlUmVuZGVyIGNhbGxiYWNrIGZvciBleHBvcnRcbiAgICAqICAgdG8gRXhjZWwsIGluc3RlYWQgZXhwb3J0IHZhbHVlIGRpcmVjdGx5LFxuICAgICogIGhlYWRlclRleHQgOjogc3RyaW5nIChvcHRpb25hbCksIG5lZWRlZCBpZiAnaGVhZGVyJyBpcyBub3QgYSB0ZXh0LFxuICAgICogIHZhbHVlUmVuZGVyIDo6IGZ1bmN0aW9uIChvcHRpb25hbCksIGRlZmluZXMgYSByZW5kZXIgZnVuY3Rpb24sXG4gICAgKiAgdmFsdWVUeXBlRXhjZWwgOjogc3RyaW5nIChvcHRpb25hbCksIGRlZmluZXMgYSB2YWx1ZSB0eXBlIGZvciBFeGNlbCBpZiBkaWZmZXJzIGZyb20gVUlcbiAgICAqIH0sXG4gICAgKiBmaWxlTmFtZSA6OiBzdHJpbmcgKG9wdGlvbmFsKSwgZGVmaW5lcyBhIGZpbGUgbmFtZSxcbiAgICAqIGRpZ2l0cyA6OiBbbnVtYmVyLCBhcnJheV0gKG9wdGlvbmFsKSwgZGVmaW5lcyBhIG51bWJlciBvZiBkaWdpdHMgZm9yIGRlY2ltYWxzIGluIGFsbCB0YWJsZVxuICAgICogICBvciBhbiBhcnJheSBjb250YWluaW5nIGRpZ2l0cyBmb3IgY2VsbHMsXG4gICAgKiB2aXNpYmxlQ29sdW1ucyA6OiBsaXN0IChvcHRpb25hbCksIGRlZmluZXMgdmlzaWJsZSBjb2x1bW5zIGluIGNhc2UgY29sdW1uIHNldHRpbmdzIGFyZSB1c2VkLlxuICAgICovXG4gIGV4cG9ydFRvRXhjZWwgPSAoZGF0YSwgY29sdW1ucywgZmlsZU5hbWUgPSAnRXhwb3J0IEZyb20gT0MnLCBkaWdpdHMgPSBudWxsLCB2aXNpYmxlQ29sdW1ucyA9IG51bGwpID0+IHtcbiAgICBjb25zdCBzaGVldE5hbWUgPSAnU2hlZXQxJztcbiAgICBjb25zdCBleHBvcnRlZENvbHVtbnMgPSBnZXRDb2x1bW5zKGNvbHVtbnMsIHZpc2libGVDb2x1bW5zKTtcbiAgICBjb25zdCBzaGVldCA9IHRoaXMuY3JlYXRlV29ya3NoZWV0KGRhdGEsIGV4cG9ydGVkQ29sdW1ucywgZGlnaXRzKTtcbiAgICBjb25zdCBib29rID0geyBTaGVldE5hbWVzOiBbc2hlZXROYW1lXSwgU2hlZXRzOiB7fSB9O1xuICAgIGJvb2suU2hlZXRzW3NoZWV0TmFtZV0gPSBzaGVldDtcbiAgICBYTFNYLndyaXRlRmlsZShib29rLCBgJHtmaWxlTmFtZX0ueGxzeGAsIHsgYm9va1R5cGU6ICd4bHN4JywgYm9va1NTVDogdHJ1ZSwgdHlwZTogJ2JpbmFyeScgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEltcG9ydCBkYXRhIGZyb20gRXhjZWxcbiAgICogSW5wdXQ6XG4gICAqIGZpbGVzIDo6IGV2ZW50LnRhcmdldC5maWxlcyBhcnJheSxcbiAgICogY2FsbGJhY2sgOjogZnVuY3Rpb24sIG9uTG9hZCBjYWxsYmFjay5cbiAgICovXG4gIGltcG9ydEZyb21FeGNlbCA9IChmaWxlcywgY2FsbGJhY2spID0+IHtcbiAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChmaWxlc1swXS50eXBlICE9PSAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgcmVhZGVyLm9ubG9hZCA9IGNhbGxiYWNrO1xuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihmaWxlc1swXSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIG9uIGxvYWQgb2YgRmlsZVJlYWRlciBmb3IgaW1wb3J0IG9wZXJhdGlvblxuICAgKiBJbnB1dDpcbiAgICogZSA6OiBldmVudCBvYmplY3QsXG4gICAqIGNvbHVtbnMgOjogYXJyYXksIGRlZmluZXMgY29sdW1uIG9iamVjdHMgd2l0aCB0aGUga2V5czpcbiAgICoge1xuICAgKiAgdmFsdWVLZXlQYXRoIDo6IGFycmF5IG9mIHN0cmluZ3MsIGRlZmluZXMgdGhlIGNvbHVtbiBpZCxcbiAgICogIHZhbHVlRXhjZWxNYXRjaCA6OiBmdW5jdGlvbiAob3B0aW9uYWwpLCBjYWxsYmFjayB0byB1cGRhdGUgdGhlIHZhbHVlIGluIGltcG9ydGVkIGRhdGEsXG4gICAqICBkZWZhdWx0VmFsdWUgOjogYW55IChvcHRpb25hbCksIGRlZmluZXMgYSBkZWZhdWx0IHZhbHVlXG4gICAqIH0sXG4gICAqIHZpc2libGVDb2x1bW5zIDo6IGxpc3QgKG9wdGlvbmFsKSwgZGVmaW5lcyB2aXNpYmxlIGNvbHVtbnMgaW4gY2FzZSBjb2x1bW4gc2V0dGluZ3MgaXMgdXNlZC5cbiAgICogT3V0cHV0OlxuICAgKiBhcnJheSBvZiBpbXBvcnRlZCBkYXRhLlxuICAgKi9cbiAgb25Mb2FkQ2FsbGJhY2sgPSAoZSwgY29sdW1ucywgdmlzaWJsZUNvbHVtbnMgPSBudWxsKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gY29udmVydEFycmF5QnVmZmVyVG9TdHJpbmcoZS50YXJnZXQucmVzdWx0KTtcbiAgICBjb25zdCBib29rID0gWExTWC5yZWFkKGJ0b2EocmVzdWx0KSwgeyB0eXBlOiAnYmFzZTY0JyB9KTtcbiAgICBjb25zdCByYXdEYXRhID1cbiAgICAgIFhMU1gudXRpbHMuc2hlZXRfdG9fanNvbihib29rLlNoZWV0c1tib29rLlNoZWV0TmFtZXNbMF1dLCB7IGhlYWRlcjogMSwgcmF3OiB0cnVlIH0pO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJhd0RhdGEpICYmIHJhd0RhdGEubGVuZ3RoIDwgMikge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBpbXBvcnRlZENvbHVtbnMgPSBnZXRDb2x1bW5zKGNvbHVtbnMsIHZpc2libGVDb2x1bW5zKTtcbiAgICBjb25zdCBkYXRhID0gW107XG4gICAgcmF3RGF0YS5mb3JFYWNoKChyb3csIHJvd0luZGV4KSA9PiB7XG4gICAgICAvLyBza2lwIHRoZSBoZWFkZXJcbiAgICAgIGlmIChyb3dJbmRleCA+PSAxKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB7fTtcbiAgICAgICAgcm93LmZvckVhY2goKGNlbGwsIGNlbGxJbmRleCkgPT4ge1xuICAgICAgICAgIGlmIChjZWxsSW5kZXggPCBpbXBvcnRlZENvbHVtbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGltcG9ydGVkQ29sdW1uc1tjZWxsSW5kZXhdLnZhbHVlRXhjZWxNYXRjaCAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgICAgICAgaW1wb3J0ZWRDb2x1bW5zW2NlbGxJbmRleF0udmFsdWVFeGNlbE1hdGNoKGNlbGwpIDogY2VsbDtcbiAgICAgICAgICAgIGl0ZW1baW1wb3J0ZWRDb2x1bW5zW2NlbGxJbmRleF0udmFsdWVLZXlQYXRoWzBdXSA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGltcG9ydGVkQ29sdW1ucy5mb3JFYWNoKChjb2x1bW4pID0+IHtcbiAgICAgICAgICBpZiAoY29sdW1uLmRlZmF1bHRWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIGl0ZW1bY29sdW1uLnZhbHVlS2V5UGF0aFswXV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaXRlbVtjb2x1bW4udmFsdWVLZXlQYXRoWzBdXSA9IGNvbHVtbi5kZWZhdWx0VmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZGF0YS5wdXNoKGl0ZW0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBFeGNlbCgpO1xuIl19