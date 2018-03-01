var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _class, _temp;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * FileInputLabel component creates a text label with a hidden file input
 * @class FileInputLabel
 * @extends React.PureComponent
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, FormControl } from 'react-bootstrap';

import './file-input-label.scss';

var FileInputLabel = (_temp = _class = function (_React$PureComponent) {
  _inherits(FileInputLabel, _React$PureComponent);

  function FileInputLabel() {
    _classCallCheck(this, FileInputLabel);

    return _possibleConstructorReturn(this, _React$PureComponent.apply(this, arguments));
  }

  FileInputLabel.prototype.render = function render() {
    var _props = this.props,
        acceptedFiles = _props.acceptedFiles,
        label = _props.label,
        onChange = _props.onChange,
        otherProps = _objectWithoutProperties(_props, ['acceptedFiles', 'label', 'onChange']);

    return React.createElement(
      ControlLabel,
      { className: 'oc-file-input-label' },
      label,
      React.createElement(FormControl, _extends({
        accept: acceptedFiles,
        className: 'oc-file-input',
        id: 'file-input',
        onChange: onChange,
        type: 'file',
        value: ''
      }, otherProps))
    );
  };

  return FileInputLabel;
}(React.PureComponent), _class.defaultProps = {
  acceptedFiles: '',
  label: 'Select file',
  onChange: function onChange() {}
}, _temp);
export { FileInputLabel as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9maWxlLWlucHV0LWxhYmVsLmNvbXBvbmVudC5qc3giXSwibmFtZXMiOlsiUmVhY3QiLCJQcm9wVHlwZXMiLCJDb250cm9sTGFiZWwiLCJGb3JtQ29udHJvbCIsIkZpbGVJbnB1dExhYmVsIiwicmVuZGVyIiwicHJvcHMiLCJhY2NlcHRlZEZpbGVzIiwibGFiZWwiLCJvbkNoYW5nZSIsIm90aGVyUHJvcHMiLCJQdXJlQ29tcG9uZW50IiwiZGVmYXVsdFByb3BzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7QUFLQSxPQUFPQSxLQUFQLE1BQWtCLE9BQWxCO0FBQ0EsT0FBT0MsU0FBUCxNQUFzQixZQUF0QjtBQUNBLFNBQVNDLFlBQVQsRUFBdUJDLFdBQXZCLFFBQTBDLGlCQUExQzs7QUFFQSxPQUFPLHlCQUFQOztJQUVxQkMsYzs7Ozs7Ozs7OzJCQWFuQkMsTSxxQkFBUztBQUFBLGlCQU1ILEtBQUtDLEtBTkY7QUFBQSxRQUVMQyxhQUZLLFVBRUxBLGFBRks7QUFBQSxRQUdMQyxLQUhLLFVBR0xBLEtBSEs7QUFBQSxRQUlMQyxRQUpLLFVBSUxBLFFBSks7QUFBQSxRQUtGQyxVQUxFOztBQU9QLFdBQ0U7QUFBQyxrQkFBRDtBQUFBLFFBQWMsV0FBVSxxQkFBeEI7QUFDR0YsV0FESDtBQUVFLDBCQUFDLFdBQUQ7QUFDRSxnQkFBUUQsYUFEVjtBQUVFLG1CQUFVLGVBRlo7QUFHRSxZQUFHLFlBSEw7QUFJRSxrQkFBVUUsUUFKWjtBQUtFLGNBQUssTUFMUDtBQU1FLGVBQU07QUFOUixTQU9NQyxVQVBOO0FBRkYsS0FERjtBQWNELEc7OztFQWxDeUNWLE1BQU1XLGEsVUFPekNDLFksR0FBZTtBQUNwQkwsaUJBQWUsRUFESztBQUVwQkMsU0FBTyxhQUZhO0FBR3BCQyxZQUFVLG9CQUFNLENBQUU7QUFIRSxDO1NBUEhMLGMiLCJmaWxlIjoiZmlsZS1pbnB1dC1sYWJlbC5jb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEZpbGVJbnB1dExhYmVsIGNvbXBvbmVudCBjcmVhdGVzIGEgdGV4dCBsYWJlbCB3aXRoIGEgaGlkZGVuIGZpbGUgaW5wdXRcbiAqIEBjbGFzcyBGaWxlSW5wdXRMYWJlbFxuICogQGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudFxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IENvbnRyb2xMYWJlbCwgRm9ybUNvbnRyb2wgfSBmcm9tICdyZWFjdC1ib290c3RyYXAnO1xuXG5pbXBvcnQgJy4vZmlsZS1pbnB1dC1sYWJlbC5zY3NzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmlsZUlucHV0TGFiZWwgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBhY2NlcHRlZEZpbGVzOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGxhYmVsOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuZWxlbWVudCwgUHJvcFR5cGVzLnN0cmluZ10pLFxuICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGFjY2VwdGVkRmlsZXM6ICcnLFxuICAgIGxhYmVsOiAnU2VsZWN0IGZpbGUnLFxuICAgIG9uQ2hhbmdlOiAoKSA9PiB7fSxcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge1xuICAgICAgYWNjZXB0ZWRGaWxlcyxcbiAgICAgIGxhYmVsLFxuICAgICAgb25DaGFuZ2UsXG4gICAgICAuLi5vdGhlclByb3BzXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIChcbiAgICAgIDxDb250cm9sTGFiZWwgY2xhc3NOYW1lPVwib2MtZmlsZS1pbnB1dC1sYWJlbFwiPlxuICAgICAgICB7bGFiZWx9XG4gICAgICAgIDxGb3JtQ29udHJvbFxuICAgICAgICAgIGFjY2VwdD17YWNjZXB0ZWRGaWxlc31cbiAgICAgICAgICBjbGFzc05hbWU9XCJvYy1maWxlLWlucHV0XCJcbiAgICAgICAgICBpZD1cImZpbGUtaW5wdXRcIlxuICAgICAgICAgIG9uQ2hhbmdlPXtvbkNoYW5nZX1cbiAgICAgICAgICB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgdmFsdWU9XCJcIlxuICAgICAgICAgIHsuLi5vdGhlclByb3BzfVxuICAgICAgICAvPlxuICAgICAgPC9Db250cm9sTGFiZWw+XG4gICAgKTtcbiAgfVxufVxuIl19