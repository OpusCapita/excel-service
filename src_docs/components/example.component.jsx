import React from 'react';
import { fromJS } from 'immutable';
import { Button, ControlLabel, Grid, Row, Col } from 'react-bootstrap';

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
