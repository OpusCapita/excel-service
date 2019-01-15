# excel-service

### Description
Excel service contains a react component for button to open import file window and JS methods to export data to Excel and import data from Excel

### Installation
It seems, that npm handles xlsx and xlsx-styles as different versions of the same component. But xlsx-style requires xlsx to be installed in the same node module tree folder with it. In order to make that happen, please follow the instructions below.

Add
```
externals: [
  { './cptable': 'var cptable' },
]
```
to webpack.config.js and run

```
npm install file-saver
```

Add @opuscapita/excel-service to package.json dependencies and run ````npm install```. Note, do not run npm install for @opuscapita/excel-service, otherwise xlsx-styles is not installed.

If xlsx-styles is installed into ```node_modules/@opuscapita/excel-service/node_modules``` do the following:

1. Run ```npm install xlsx-styles```
2. Verify that xlsx-styles is installed at the root level of the tree
3. Run ```npm dedupe```
4. Verify that xlsx-styles is removed from ```node_modules/@opuscapita/excel-service/node_modules``` and both xlsx and xlsx-styles exist in the root level of the tree.
5. Run ```npm uninstall xlsx-styles```
6. Repeat step 4.

If xlsx is installed into ```node_modules/@opuscapita/excel-service/node_modules``` do the above steps for it, but replace xlsx-styles with xlsx.

Once these steps have been executed it is enough to run only ````npm install``` and it does installation correspondingly.

### Demo
View the [DEMO](https://opuscapita.github.io/excel-service)

### Builds
#### UMD
The default build with compiled styles in the .js file. Also minified version available in the lib/umd directory.
#### CommonJS/ES Module
You need to configure your module loader to use `cjs` or `es` fields of the package.json to use these module types.
Also you need to configure sass loader, since all the styles are in sass format.
* With webpack use [resolve.mainFields](https://webpack.js.org/configuration/resolve/#resolve-mainfields) to configure the module type.
* Add [SASS loader](https://github.com/webpack-contrib/sass-loader) to support importing of SASS styles.

### API FileInputLabel
| Prop name     | Type              | Default       | Description              |
| ------------- | ----------------- | ------------- | ------------------------ |
| acceptedFiles | string            | ''            | String with file formats |
| label         | [element, string] | 'Select file' | Label for the button     |
| onChange      | function          | () => {}      | Callback on file import  |

### API Excel
| Method              | Input                                                                                                                                  | Description                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| exportToExcel       | data :: List, columns :: array of objects, fileName :: string (optional), digits :: [number, array] (optional), visibleColumns :: List | Exports data with specified columns to an Excel file.                              |
| importFromExcel     | files :: array, callback :: function                                                                                                   | Imports data from an Excel file. Use alert callabck for a failed import operation. |
| onLoadCallback      | e :: event object, columns :: array of objects, visibleColumns :: List (optional)                                                      | Callback on data import                                                            |
| exportSheetsToExcel | sheets :: array of Sheet, fileName :: string                                                                                           | Exports data with specified columns to an Excel file.                              |


#### Sheet
| Prop name | Type                       | Default                                    | Description                                                                                                                                                                                            |
| --------- | -------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| columns   | array of Columns or arrays | []                                         | Column headers. In case of one column hedaer row, array contains Column objects, and in case of several column header rows, array contains arrays of Column objects.                                   |
| data      | array of arrays or objects | []                                         | Either array of arrays, which contains objects, with value prop (to be used when no column headers). Or array of (row) objects, which contains props, which match to column valueKeyPath props values. |
| dataStyle | object                     |                                            | Style for data, for more information refer to [xlsx-styles cell style syntax] (https://www.npmjs.com/package/xlsx-styles#cell-styles)                                                                  |
| formatter | function                   |                                            | Formatting function for data values                                                                                                                                                                    |
| name      | string                     | 'Sheet x', where x is sheet's order number | Sheet's name                                                                                                                                                                                           |
| noBorders | boolean                    | false                                      | True, if cell borders                                                                                                                                                                                  |
| rows      | array of Rows              | []                                         | Row header.                                                                                                                                                                                            |

#### Column
| Prop name    | Type   | Default | Description                 |
| ------------ | ------ | ------- | --------------------------- |
| header       | string |         | Column header label         |
| merge        | number |         | Count of cells to be merged |
| valueKeyPath | array  |         | path to column value        |

#### Row
| Prop name | Type   | Default | Description      |
| --------- | ------ | ------- | ---------------- |
| header    | string |         | Row header label |


### Code example
```jsx
import React from 'react';
import { fromJS } from 'immutable';
import { Button, ControlLabel, Grid, Row, Col } from 'react-bootstrap';

import { Excel, FileInputLabel } from '@opuscapita/excel-service';

export default class ExampleView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.columns = this.initializeColumns();
    this.state = { data: this.initializeData() };
  }

  initializeColumns = () => ([
    {
      header: 'String',
      valueKeyPath: ['string'],
      width: 200,
    },
    {
      header: 'Number',
      valueKeyPath: ['number'],
      width: 200,
    },
    {
      header: 'Float',
      valueKeyPath: ['float'],
      width: 200,
    },
  ])

  initializeData = () => {
    const data = [];
    for (let i = 0; i < 10; i += 1) {
      data.push({ string: `Item ${i}`, number: i, float: `${i}.00` });
    }
    return data;
  }

  readExcelData = (e) => {
    const data = Excel.onLoadCallback(e, this.columns);
    this.setState({ data });
  }

  handleExportToExcelClick = () => {
    Excel.exportToExcel(fromJS(this.state.data), this.columns, 'ExampleExport');
  }

  handleImportFromExcelClick = (e) => {
    Excel.importFromExcel(e.target.files, this.readExcelData);
  }

  render() {
    return (
      <Grid fluid>
        <Row>
          {this.columns.map(column => (
            <Col xs={4} key={column.header}>
              <ControlLabel>
                {column.header}
              </ControlLabel>
            </Col>
          ))}
        </Row>
        {this.state.data.map(row => (
          <Row key={row.number}>
            <Col xs={4}>
              {row.string}
            </Col>
            <Col xs={4}>
              {row.number}
            </Col>
            <Col xs={4}>
              {row.float}
            </Col>
          </Row>
        ))}
        <Row>
          <Col xs={12}>
            <Button onClick={this.handleExportToExcelClick}>
              Export to Excel
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Button>
              <FileInputLabel
                acceptedFiles=".xlsx"
                label="Import from Excel"
                onChange={this.handleImportFromExcelClick}
              />
            </Button>
          </Col>
        </Row>
      </Grid>
    );
  }
}
```
