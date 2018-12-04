import React from 'react';
import { fromJS } from 'immutable';
import {
  Button,
  ControlLabel,
  Grid,
  Row,
  Col,
} from 'react-bootstrap';

import { Excel, FileInputLabel } from '../../src/index';

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
    const { data } = this.state;
    Excel.exportToExcel(fromJS(data), this.columns, 'ExampleExport');
  }

  handleStyledExportToExcelClick = () => {
    const { data } = this.state;
    const { columns } = this;
    const sheets = [
      {
        columns,
        data,
        headerStyle: { font: { bold: true } },
      },
    ];
    Excel.exportSheetsToExcel(sheets, 'ExampleStyledExport');
  }

  handleImportFromExcelClick = (e) => {
    Excel.importFromExcel(e.target.files, this.readExcelData);
  }

  render() {
    const { data } = this.state;
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
        {data.map(row => (
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
              Export to Excel
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Button
              id="exportSheetsButton"
              onClick={this.handleStyledExportToExcelClick}
            >
              Styled export to Excel
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
