/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
import XLSX from 'xlsx-styles';
import saveAs from 'file-saver';

const writeOptions = {
  type: 'binary',
  bookSST: false,
  bookType: 'xlsx',
  showGridLines: false,
};

const EXCEL_MAX_ROW_COUNT = 1048576;
const EXCEL_MAX_COL_COUNT = 16384;

// https://www.npmjs.com/package/xlsx-styles#cell-styles
const borderStyle = { style: 'thin', color: { rgb: 'CCCCCC' } };
const border = {
  border: {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle,
  },
};

const createColumnTitles = (
  columns = [],
  colOffset,
  headerStyle,
  noBorders = false,
  cells = [],
  rowIndex = 0,
) => {
  const row = [];
  columns.forEach((column, colIndex) => {
    const cellIndex = colOffset + colIndex;
    if (Array.isArray(column)) {
      return createColumnTitles(column, colOffset, headerStyle, noBorders, cells, colIndex);
    }
    const cellValue = (column || {}).header || '';
    const cell = { v: cellValue, t: 's', s: headerStyle };
    if (!noBorders) {
      cell.s = { ...cell.s, ...border };
    }
    const cellRef = XLSX.utils.encode_cell({ c: cellIndex, r: rowIndex });
    const cellData = { cell, cellRef };
    if (column && column.merge > 1) {
      cellData.merge = {
        s: {
          c: cellIndex,
          r: rowIndex,
        },
        e: {
          c: cellIndex + (column.merge - 1),
          r: rowIndex,
        },
      };
    }
    const upperCell = rowIndex > 0 ? cells[rowIndex - 1][colIndex] : undefined;
    if (column && column.valueKeyPath) {
      cellData.valueKeyPath = column.valueKeyPath;
      cellData.valueRender = column.valueRender;
      cellData.disableValueRenderInExcel = column.disableValueRenderInExcel;
      if (column.valueOptions && column.valueOptions.multiplier) {
        cellData.multiplier = column.valueOptions.multiplier;
      }
    } else if (rowIndex > 0) {
      cellData.valueKeyPath = upperCell.valueKeyPath;
    }
    const wch = upperCell && !upperCell.merge && upperCell.wch > cellValue.length
      ? upperCell.wch
      : cellValue.length;
    cellData.wch = wch;
    row.push(cellData);
  });
  if (row.length > 0) {
    cells.push(row);
  }
  return cells;
};

const createDataSheet = (exportData) => {
  const {
    columns,
    data = [],
    dataStyle,
    formatter,
    headerStyle,
    noBorders,
    rows,
  } = exportData;
  const worksheet = {};
  const colOffset = rows && rows.length > 0 ? 1 : 0;
  const columnTitles = createColumnTitles(columns, colOffset, headerStyle, noBorders);
  const rowOffset = columnTitles.length;

  const merges = [];
  if (rows && rows.length > 0 && rowOffset > 1) {
    merges.push({ s: { c: 0, r: 0 }, e: { c: 0, r: rowOffset - 1 } });
  }

  const cols = [];

  columnTitles.forEach(columnRow => (
    columnRow.forEach((columnTitle, colIndex) => {
      worksheet[columnTitle.cellRef] = columnTitle.cell;
      if (columnTitle.merge) {
        merges.push(columnTitle.merge);
      }
      cols[colIndex] = { wch: columnTitle.wch };
    })
  ));

  if (rows) {
    let wch = 0;
    rows.forEach((row, rowIndex) => {
      const cellRowIndex = rowIndex + rowOffset;
      const cellRef = XLSX.utils.encode_cell({ c: 0, r: cellRowIndex });
      const title = row.header;
      const width = title ? title.length : 0;
      wch = wch < width ? width : wch;
      const cell = { v: title, t: 's', s: headerStyle };
      if (!noBorders) {
        cell.s = { ...cell.s, ...border };
      }
      worksheet[cellRef] = cell;
    });
    cols.unshift({ wch });
  }
  worksheet['!cols'] = cols;
  worksheet['!merges'] = merges;

  const createCell = (value, colIndex, rowIndex) => {
    const cellRowIndex = rowIndex + rowOffset;
    const cellColIndex = colIndex + colOffset;
    const cell = { v: value, s: dataStyle };
    if (!noBorders) {
      cell.s = { ...cell.s, ...border };
    }
    const cellRef = XLSX.utils.encode_cell({ c: cellColIndex, r: cellRowIndex });
    switch (typeof value) {
      case ('number'): {
        cell.t = 'n';
        break;
      }
      case ('boolean'): {
        cell.t = 'b';
        break;
      }
      default: {
        cell.t = 's';
        break;
      }
    }
    worksheet[cellRef] = cell;
  };

  const formatCell = (value, column, row) => {
    const { disableValueRenderInExcel, multiplier, valueRender } = column;
    let cellValue = multiplier && typeof value === 'number' ? multiplier * value : value;
    if (valueRender && !disableValueRenderInExcel) {
      cellValue = valueRender(row);
    } else if (formatter) {
      cellValue = formatter(cellValue);
    }
    return cellValue;
  };

  const detailedColumns = columnTitles.length > 0 ? columnTitles[rowOffset - 1] : [];
  let endColumnIndex = 0;
  if (detailedColumns.length > 0) {
    data.forEach((row, rowIndex) => {
      detailedColumns.forEach((column, colIndex) => {
        const cellValue = formatCell(row.getIn
          ? row.getIn(column.valueKeyPath)
          : row[column.valueKeyPath], column, row);
        createCell(cellValue, colIndex, rowIndex);
      });
    });
    endColumnIndex = detailedColumns.length + colOffset;
  } else {
    data.forEach((row, rowIndex) => {
      row.forEach((column, colIndex) => {
        const cellValue = formatCell(column.value, column, row);
        createCell(cellValue, colIndex, rowIndex);
        const currentColIndex = colIndex + colOffset;
        endColumnIndex = endColumnIndex < currentColIndex ? currentColIndex : endColumnIndex;
        cols.push({ wch: 50 });
      });
    });
  }
  const endRowIndex = (data.length || data.size) + rowOffset;
  const range = {
    s: {
      c: 0,
      r: 0,
    },
    e: {
      c: endColumnIndex,
      r: endRowIndex,
    },
  };
  if (range.e.c < EXCEL_MAX_COL_COUNT && range.e.r < EXCEL_MAX_ROW_COUNT) {
    worksheet['!ref'] = XLSX.utils.encode_range(range);
  }

  return worksheet;
};

export default (sheets, fileName) => {
  const workbook = { SheetNames: [], Sheets: {} };

  sheets.forEach((sheet, index) => {
    const sheetName = sheet.name || `Sheet ${index + 1}`;
    workbook.SheetNames.push(sheetName);
    const wsSheet = createDataSheet(sheet);
    workbook.Sheets[sheetName] = wsSheet;
  });

  const wbout = XLSX.write(workbook, writeOptions);
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  /* the saveAs call downloads a file on the local machine */
  saveAs(new Blob([s2ab(wbout)], { type: '' }), `${fileName}.xlsx`);
};
