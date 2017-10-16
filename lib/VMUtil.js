'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactRedux = require('./alias/react-redux');

var _reactRedux2 = _interopRequireDefault(_reactRedux);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * View Model Utility
 */
var _VMUtil = function () {
  function _VMUtil() {
    _classCallCheck(this, _VMUtil);
  }

  _createClass(_VMUtil, [{
    key: 'connect',


    /** Connects ViewModel to View. */
    value: function connect(VMTypeOrObject, View) {
      var _mapVMToProps = mapVMToProps(VMTypeOrObject),
          mapStateToProps = _mapVMToProps.mapStateToProps,
          mapDispatchToProps = _mapVMToProps.mapDispatchToProps;

      var connector = _reactRedux2.default.connect(mapStateToProps, mapDispatchToProps);
      return connector(View);
    }
  }]);

  return _VMUtil;
}();

var VMUtil = new _VMUtil();
exports.default = VMUtil;


function mapVMClassToProps(VMType) {
  function mapVMDispatchToProps(dispatch) {
    var vm = new VMType(dispatch);
    var dispatchMap = mapVMForDispatch(vm);
    function mapVMInstanceDispatchToProps() {
      return dispatchMap;
    }
    // Memoize dispatchMap instead of just returning it.
    return mapVMInstanceDispatchToProps;
  }
  return {
    mapStateToProps: VMType.mapStateToProps,
    mapDispatchToProps: VMType.mapDispatchToProps || (VMType.noDispatch ? undefined : mapVMDispatchToProps)
  };
}
/**
 * @param {object} vm Instace of the VMType.
 */
function mapVMForDispatch(vm) {
  var map = {};
  var memberNames = Object.getOwnPropertyNames(vm);
  memberNames.forEach(function (name) {
    switch (name) {
      case 'constructor':
      case 'dispatch':
        return;
      default:
    }
    var member = vm[name];
    if (typeof member !== 'function') return;
    map[name] = member;
  });
  map.vm = vm;
  return map;
}

function mapVMToProps(VMTypeOrObject) {
  if (typeof VMTypeOrObject === 'function') {
    return mapVMClassToProps(VMTypeOrObject);
  }
  return VMTypeOrObject || {};
}