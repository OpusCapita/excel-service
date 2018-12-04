'use strict';

exports.__esModule = true;
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _class, _temp; /**
                    * FileInputLabel component creates a text label with a hidden file input
                    * @class FileInputLabel
                    * @extends React.PureComponent
                    */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactBootstrap = require('react-bootstrap');

require('./file-input-label.scss');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

    return _react2.default.createElement(
      _reactBootstrap.ControlLabel,
      { className: 'oc-file-input-label' },
      label,
      _react2.default.createElement(_reactBootstrap.FormControl, _extends({
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
}(_react2.default.PureComponent), _class.defaultProps = {
  acceptedFiles: '',
  label: 'Select file',
  onChange: function onChange() {}
}, _temp);
exports.default = FileInputLabel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9maWxlLWlucHV0LWxhYmVsLmNvbXBvbmVudC5qc3giXSwibmFtZXMiOlsiRmlsZUlucHV0TGFiZWwiLCJyZW5kZXIiLCJwcm9wcyIsImFjY2VwdGVkRmlsZXMiLCJsYWJlbCIsIm9uQ2hhbmdlIiwib3RoZXJQcm9wcyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OzttQkFBQTs7Ozs7OztBQUtBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O0lBRXFCQSxjOzs7Ozs7Ozs7MkJBYW5CQyxNLHFCQUFTO0FBQUEsaUJBTUgsS0FBS0MsS0FORjtBQUFBLFFBRUxDLGFBRkssVUFFTEEsYUFGSztBQUFBLFFBR0xDLEtBSEssVUFHTEEsS0FISztBQUFBLFFBSUxDLFFBSkssVUFJTEEsUUFKSztBQUFBLFFBS0ZDLFVBTEU7O0FBT1AsV0FDRTtBQUFDLGtDQUFEO0FBQUEsUUFBYyxXQUFVLHFCQUF4QjtBQUNHRixXQURIO0FBRUUsb0NBQUMsMkJBQUQ7QUFDRSxnQkFBUUQsYUFEVjtBQUVFLG1CQUFVLGVBRlo7QUFHRSxZQUFHLFlBSEw7QUFJRSxrQkFBVUUsUUFKWjtBQUtFLGNBQUssTUFMUDtBQU1FLGVBQU07QUFOUixTQU9NQyxVQVBOO0FBRkYsS0FERjtBQWNELEc7OztFQWxDeUNDLGdCQUFNQyxhLFVBT3pDQyxZLEdBQWU7QUFDcEJOLGlCQUFlLEVBREs7QUFFcEJDLFNBQU8sYUFGYTtBQUdwQkMsWUFBVSxvQkFBTSxDQUFFO0FBSEUsQztrQkFQSEwsYyIsImZpbGUiOiJmaWxlLWlucHV0LWxhYmVsLmNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRmlsZUlucHV0TGFiZWwgY29tcG9uZW50IGNyZWF0ZXMgYSB0ZXh0IGxhYmVsIHdpdGggYSBoaWRkZW4gZmlsZSBpbnB1dFxuICogQGNsYXNzIEZpbGVJbnB1dExhYmVsXG4gKiBAZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50XG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgQ29udHJvbExhYmVsLCBGb3JtQ29udHJvbCB9IGZyb20gJ3JlYWN0LWJvb3RzdHJhcCc7XG5cbmltcG9ydCAnLi9maWxlLWlucHV0LWxhYmVsLnNjc3MnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaWxlSW5wdXRMYWJlbCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGFjY2VwdGVkRmlsZXM6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgbGFiZWw6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5lbGVtZW50LCBQcm9wVHlwZXMuc3RyaW5nXSksXG4gICAgb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgYWNjZXB0ZWRGaWxlczogJycsXG4gICAgbGFiZWw6ICdTZWxlY3QgZmlsZScsXG4gICAgb25DaGFuZ2U6ICgpID0+IHt9LFxuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7XG4gICAgICBhY2NlcHRlZEZpbGVzLFxuICAgICAgbGFiZWwsXG4gICAgICBvbkNoYW5nZSxcbiAgICAgIC4uLm90aGVyUHJvcHNcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gKFxuICAgICAgPENvbnRyb2xMYWJlbCBjbGFzc05hbWU9XCJvYy1maWxlLWlucHV0LWxhYmVsXCI+XG4gICAgICAgIHtsYWJlbH1cbiAgICAgICAgPEZvcm1Db250cm9sXG4gICAgICAgICAgYWNjZXB0PXthY2NlcHRlZEZpbGVzfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIm9jLWZpbGUtaW5wdXRcIlxuICAgICAgICAgIGlkPVwiZmlsZS1pbnB1dFwiXG4gICAgICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlfVxuICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICB2YWx1ZT1cIlwiXG4gICAgICAgICAgey4uLm90aGVyUHJvcHN9XG4gICAgICAgIC8+XG4gICAgICA8L0NvbnRyb2xMYWJlbD5cbiAgICApO1xuICB9XG59XG4iXX0=