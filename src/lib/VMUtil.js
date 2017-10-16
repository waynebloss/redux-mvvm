import ReactRedux from './alias/react-redux';

/**
 * View Model Utility
 */
class _VMUtil {

  /** Connects ViewModel to View. */
  connect(VMTypeOrObject, View) {
    const {
      mapStateToProps,
      mapDispatchToProps,
    } = mapVMToProps(VMTypeOrObject);
    const connector = ReactRedux.connect(
      mapStateToProps, 
      mapDispatchToProps
    );
    return connector(View);
  }
  
}
const VMUtil = new _VMUtil();
export default VMUtil;

function mapVMClassToProps(VMType) {
  function mapVMDispatchToProps(dispatch) {
    const vm = new VMType(dispatch);
    const dispatchMap = mapVMForDispatch(vm);
    function mapVMInstanceDispatchToProps() {
      return dispatchMap;
    }
    // Memoize dispatchMap instead of just returning it.
    return mapVMInstanceDispatchToProps;
  }
  return {
    mapStateToProps: VMType.mapStateToProps,
    mapDispatchToProps: VMType.mapDispatchToProps || (
      VMType.noDispatch ? undefined : mapVMDispatchToProps
    )
  };
}
/**
 * @param {object} vm Instace of the VMType.
 */
function mapVMForDispatch(vm) {
  const map = {};
  const memberNames = Object.getOwnPropertyNames(vm);
  memberNames.forEach(name => {
    switch(name) {
      case 'constructor':
      case 'dispatch': return;
      default:
    }
    const member = vm[name];
    if (typeof member !== 'function')
      return;
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
