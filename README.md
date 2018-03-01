# excel-service

### Description
Excel service contains a react component for button to open import file window and JS service with methods to export data to Excel and import data from Excel

### Installation
```
npm install @opuscapita/excel-service
```

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

### API Excel
| Prop name                | Type             | Default                                  | Description                              |
| ------------------------ | ---------------- | ---------------------------------------- | ---------------------------------------- |
| acceptedFiles            | string           | ''                                       | String with file formats                 |
| label                    | [element, string] | 'Select file'                            | Label for the button                     |
| onChange                 | function         | () => {}                                 | Callback on file import                 |

### API FileInputlabel
| Method                   | Input                                                       | Description                              |
| ------------------------ | ----------------------------------------------------------- | ---------------------------------------- |
| exportToExcel            | data :: List, columns :: array, fileName :: string (optional), digits :: [number, array] (optional), visibleColumns :: List | Exports data with specified columns to an Excel file. |
| importFromExcel          | files :: array, callback :: function, alertCallback :: function (optional) | Imports data from an Excel file. Use alert callabck for a failed import operation. |
| onLoadCallback           | event :: event object, columns :: array, visibleColumns :: List (optional) | Callback on data import |

### Code example
```jsx
import React from 'react';
import { Excel, FileInputLabel } from '../../src/index';

export default class ExampleView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.columns = this.initializeColumns();
    this.state = { data: this.initializeData() };
  }

  initializeColumns = () => {
    const columns = [
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
    ];
    return columns;
  }

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
      <div>
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
            <Button
              id="exportButton"
              onClick={this.handleExportToExcelClick}
            >
              <ControlLabel>
                Export to Excel
              </ControlLabel>
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Button
              id="importButton"
            >
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
