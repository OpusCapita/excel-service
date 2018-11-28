'use strict';

exports.__esModule = true;
exports.convertValueType = exports.convertArrayBufferToString = exports.getColumns = undefined;

var _immutable = require('immutable');

var getColumns = exports.getColumns = function getColumns(columns, visibleColumns) {
  if (!_immutable.List.isList(visibleColumns)) {
    return columns;
  }
  var newColumns = [];
  visibleColumns.forEach(function (key) {
    var columnIndex = columns.findIndex(function (c) {
      return c.valueKeyPath.join('/') === key;
    });
    if (columnIndex !== -1) {
      newColumns.push(columns[columnIndex]);
    }
  });
  return newColumns;
};

var convertArrayBufferToString = exports.convertArrayBufferToString = function convertArrayBufferToString(data) {
  /* eslint-disable no-plusplus */
  var w = 10240;
  var str = '';
  var l = 0;
  for (l; l < data.byteLength / w; ++l) {
    str += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
  }
  str += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
  return str;
};

var convertValueType = exports.convertValueType = function convertValueType(value, type) {
  var VALUE_TYPES = {
    number: 'number',
    string: 'string'
  };
  switch (type) {
    case VALUE_TYPES.number:
      return Number(value);
    default:
      return String(value);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leGNlbC51dGlscy5qcyJdLCJuYW1lcyI6WyJnZXRDb2x1bW5zIiwiY29sdW1ucyIsInZpc2libGVDb2x1bW5zIiwiaXNMaXN0IiwibmV3Q29sdW1ucyIsImZvckVhY2giLCJrZXkiLCJjb2x1bW5JbmRleCIsImZpbmRJbmRleCIsImMiLCJ2YWx1ZUtleVBhdGgiLCJqb2luIiwicHVzaCIsImNvbnZlcnRBcnJheUJ1ZmZlclRvU3RyaW5nIiwiZGF0YSIsInciLCJzdHIiLCJsIiwiYnl0ZUxlbmd0aCIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImFwcGx5IiwiVWludDhBcnJheSIsInNsaWNlIiwiY29udmVydFZhbHVlVHlwZSIsInZhbHVlIiwidHlwZSIsIlZBTFVFX1RZUEVTIiwibnVtYmVyIiwic3RyaW5nIiwiTnVtYmVyIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOztBQUVPLElBQU1BLGtDQUFhLFNBQWJBLFVBQWEsQ0FBQ0MsT0FBRCxFQUFVQyxjQUFWLEVBQTZCO0FBQ3JELE1BQUksQ0FBQyxnQkFBS0MsTUFBTCxDQUFZRCxjQUFaLENBQUwsRUFBa0M7QUFDaEMsV0FBT0QsT0FBUDtBQUNEO0FBQ0QsTUFBTUcsYUFBYSxFQUFuQjtBQUNBRixpQkFBZUcsT0FBZixDQUF1QixVQUFDQyxHQUFELEVBQVM7QUFDOUIsUUFBTUMsY0FBY04sUUFBUU8sU0FBUixDQUFrQjtBQUFBLGFBQUtDLEVBQUVDLFlBQUYsQ0FBZUMsSUFBZixDQUFvQixHQUFwQixNQUE2QkwsR0FBbEM7QUFBQSxLQUFsQixDQUFwQjtBQUNBLFFBQUlDLGdCQUFnQixDQUFDLENBQXJCLEVBQXdCO0FBQ3RCSCxpQkFBV1EsSUFBWCxDQUFnQlgsUUFBUU0sV0FBUixDQUFoQjtBQUNEO0FBQ0YsR0FMRDtBQU1BLFNBQU9ILFVBQVA7QUFDRCxDQVpNOztBQWNBLElBQU1TLGtFQUE2QixTQUE3QkEsMEJBQTZCLENBQUNDLElBQUQsRUFBVTtBQUNsRDtBQUNBLE1BQU1DLElBQUksS0FBVjtBQUNBLE1BQUlDLE1BQU0sRUFBVjtBQUNBLE1BQUlDLElBQUksQ0FBUjtBQUNBLE9BQUtBLENBQUwsRUFBUUEsSUFBSUgsS0FBS0ksVUFBTCxHQUFrQkgsQ0FBOUIsRUFBaUMsRUFBRUUsQ0FBbkMsRUFBc0M7QUFDcENELFdBQU9HLE9BQU9DLFlBQVAsQ0FBb0JDLEtBQXBCLENBQTBCLElBQTFCLEVBQWdDLElBQUlDLFVBQUosQ0FBZVIsS0FBS1MsS0FBTCxDQUFXTixJQUFJRixDQUFmLEVBQW1CRSxJQUFJRixDQUFMLEdBQVVBLENBQTVCLENBQWYsQ0FBaEMsQ0FBUDtBQUNEO0FBQ0RDLFNBQU9HLE9BQU9DLFlBQVAsQ0FBb0JDLEtBQXBCLENBQTBCLElBQTFCLEVBQWdDLElBQUlDLFVBQUosQ0FBZVIsS0FBS1MsS0FBTCxDQUFXTixJQUFJRixDQUFmLENBQWYsQ0FBaEMsQ0FBUDtBQUNBLFNBQU9DLEdBQVA7QUFDRCxDQVZNOztBQVlBLElBQU1RLDhDQUFtQixTQUFuQkEsZ0JBQW1CLENBQUNDLEtBQUQsRUFBUUMsSUFBUixFQUFpQjtBQUMvQyxNQUFNQyxjQUFjO0FBQ2xCQyxZQUFRLFFBRFU7QUFFbEJDLFlBQVE7QUFGVSxHQUFwQjtBQUlBLFVBQVFILElBQVI7QUFDRSxTQUFLQyxZQUFZQyxNQUFqQjtBQUNFLGFBQU9FLE9BQU9MLEtBQVAsQ0FBUDtBQUNGO0FBQ0UsYUFBT04sT0FBT00sS0FBUCxDQUFQO0FBSko7QUFNRCxDQVhNIiwiZmlsZSI6ImV4Y2VsLnV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTGlzdCB9IGZyb20gJ2ltbXV0YWJsZSc7XG5cbmV4cG9ydCBjb25zdCBnZXRDb2x1bW5zID0gKGNvbHVtbnMsIHZpc2libGVDb2x1bW5zKSA9PiB7XG4gIGlmICghTGlzdC5pc0xpc3QodmlzaWJsZUNvbHVtbnMpKSB7XG4gICAgcmV0dXJuIGNvbHVtbnM7XG4gIH1cbiAgY29uc3QgbmV3Q29sdW1ucyA9IFtdO1xuICB2aXNpYmxlQ29sdW1ucy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBjb25zdCBjb2x1bW5JbmRleCA9IGNvbHVtbnMuZmluZEluZGV4KGMgPT4gYy52YWx1ZUtleVBhdGguam9pbignLycpID09PSBrZXkpO1xuICAgIGlmIChjb2x1bW5JbmRleCAhPT0gLTEpIHtcbiAgICAgIG5ld0NvbHVtbnMucHVzaChjb2x1bW5zW2NvbHVtbkluZGV4XSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG5ld0NvbHVtbnM7XG59O1xuXG5leHBvcnQgY29uc3QgY29udmVydEFycmF5QnVmZmVyVG9TdHJpbmcgPSAoZGF0YSkgPT4ge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wbHVzcGx1cyAqL1xuICBjb25zdCB3ID0gMTAyNDA7XG4gIGxldCBzdHIgPSAnJztcbiAgbGV0IGwgPSAwO1xuICBmb3IgKGw7IGwgPCBkYXRhLmJ5dGVMZW5ndGggLyB3OyArK2wpIHtcbiAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDhBcnJheShkYXRhLnNsaWNlKGwgKiB3LCAobCAqIHcpICsgdykpKTtcbiAgfVxuICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDhBcnJheShkYXRhLnNsaWNlKGwgKiB3KSkpO1xuICByZXR1cm4gc3RyO1xufTtcblxuZXhwb3J0IGNvbnN0IGNvbnZlcnRWYWx1ZVR5cGUgPSAodmFsdWUsIHR5cGUpID0+IHtcbiAgY29uc3QgVkFMVUVfVFlQRVMgPSB7XG4gICAgbnVtYmVyOiAnbnVtYmVyJyxcbiAgICBzdHJpbmc6ICdzdHJpbmcnLFxuICB9O1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIFZBTFVFX1RZUEVTLm51bWJlcjpcbiAgICAgIHJldHVybiBOdW1iZXIodmFsdWUpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgfVxufTtcbiJdfQ==