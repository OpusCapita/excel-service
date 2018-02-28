import React from 'react';
import { List, Map } from 'immutable';
import { Button, ControlLabel, Grid, Row, Col } from 'react-bootstrap';

import FileInputLabel, { exportToExcel, importFromExcel, onLoadCallback } from '../../src/index';

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
        valueType: 'string',
        width: 200,
      },
      {
        header: 'Number',
        valueKeyPath: ['number'],
        valueType: 'number',
        width: 200,
      },
      {
        header: 'Float',
        valueKeyPath: ['float'],
        valueType: 'number',
        width: 200,
      },
    ];
    return columns;
  }

  initializeData = () => {
    const data = List();
    for (let i = 0; i < 20; i += 1) {
      data.push(Map({ string: `Item ${i}`, number: i, float: `${i}.00` }));
    }
    return data;
  }

  readExcelData = (e) => {
    const excelData = onLoadCallback(e, this.columns);
    this.setState({ data: excelData });
  }

  handleExportToExcelClick = () => {
    exportToExcel(this.state.data, this.columns, 'ExampleExport');
  }

  handleImportFromExcelClick = (e) => {
    importFromExcel(e.target.files, this.readExcelData);
  }

  render() {
    return (
      <Grid>
        <Row>
          {this.columns.map((column) => {
            return (
              <Col xs={4} key={column.header}>
                {column.header}
              </Col>
            );
          })}
        </Row>
        {this.state.data.map((row) => {
          return (
            <Row key={row.get('number')}>
              <Col xs={4}>
                {row.get('string')}
              </Col>
              <Col xs={4}>
                {row.get('number')}
              </Col>
              <Col xs={4}>
                {row.get('float')}
              </Col>
            </Row>
          );
        })}
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
