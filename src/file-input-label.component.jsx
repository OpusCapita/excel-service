/**
 * FileInputLabel component creates a text label with a hidden file input
 * @class FileInputLabel
 * @extends React.PureComponent
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, FormControl } from 'react-bootstrap';

import './file-input-label.scss';

export default class FileInputLabel extends React.PureComponent {
  static propTypes = {
    acceptedFiles: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    onChange: PropTypes.func,
  };

  static defaultProps = {
    acceptedFiles: '',
    label: 'Select file',
    onChange: () => {},
  };

  render() {
    const {
      acceptedFiles,
      label,
      onChange,
      ...otherProps
    } = this.props;
    return (
      <ControlLabel className="oc-file-input-label">
        {label}
        <FormControl
          accept={acceptedFiles}
          className="oc-file-input"
          id="file-input"
          onChange={onChange}
          type="file"
          value=""
          {...otherProps}
        />
      </ControlLabel>
    );
  }
}
