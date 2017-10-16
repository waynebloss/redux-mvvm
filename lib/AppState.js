'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _redux = require('./alias/redux');

var _redux2 = _interopRequireDefault(_redux);

var _reduxLogger = require('./alias/redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

var _reduxPersist = require('./alias/redux-persist');

var _reduxPersist2 = _interopRequireDefault(_reduxPersist);

var _reduxFirstRouter = require('./alias/redux-first-router');

var _reduxFirstRouter2 = _interopRequireDefault(_reduxFirstRouter);

var _VMUtil = require('./VMUtil');

var _VMUtil2 = _interopRequireDefault(_VMUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __DEV__ = process.env.NODE_ENV === 'development';

var _AppState = function () {
  function _AppState() {
    _classCallCheck(this, _AppState);

    this.persistor = null;
    this.store = null;
  }
  /**
   * The current redux persistor.
   * @type {ReduxPersistor}
   */

  /**
   * The current redux store.
   * @type {ReduxStore}
   */


  _createClass(_AppState, [{
    key: 'connect',

    /**
     * Connects view models to views.
     * @param {function} ViewModelType The view-model class or object.
     * @param {function} View The view component class or function.
     */
    value: function connect(ViewModelType, View) {
      return _VMUtil2.default.connect(ViewModelType, View);
    }
    /**
     * Returns a new redux state store.
     * @param {object[]} subStates Array of sub-states.
     * @param {object} routes Map of actions to url.
     */

  }, {
    key: 'createStore',
    value: function createStore(subStates, routes) {
      if (AppState.store) throw new Error('AppState store already created.');

      var sub = mapSubStates(subStates);
      var router = createRouter(sub, routes);
      var rootReducer = _redux2.default.combineReducers(sub.reducers);
      var middleware = configureMiddleware(router.middleware);
      var enhancedMiddleware = _redux2.default.compose(router.enhancer, middleware);
      var store = _redux2.default.createStore(rootReducer, sub.preloadedState, enhancedMiddleware);
      var persistor = _reduxPersist2.default.createPersistor(store, { blacklist: sub.noPersist });

      AppState.persistor = persistor;
      AppState.store = store;

      return store;
    }
    /**
     * Dispatch an action with the store.
    */

  }, {
    key: 'dispatch',
    value: function dispatch(action) {
      AppState.store.dispatch(action);
    }

    /**
     * Purge persisted state with the persistor.
     */

  }, {
    key: 'purge',
    value: function purge() {
      AppState.persistor.purge();
    }
  }]);

  return _AppState;
}();

var AppState = new _AppState();
exports.default = AppState;


function configureMiddleware() {
  var middlewareToApply = [];
  if (__DEV__) {
    var logger = _reduxLogger2.default.createLogger();
    middlewareToApply.push(logger);
  }

  for (var _len = arguments.length, middleware = Array(_len), _key = 0; _key < _len; _key++) {
    middleware[_key] = arguments[_key];
  }

  middlewareToApply = middlewareToApply.concat(middleware);
  return _redux2.default.applyMiddleware.apply(_redux2.default, _toConsumableArray(middlewareToApply));
}

function createReducer(subState) {
  var subReducer = subState.reducer;
  if (subReducer) return subReducer;
  var defaultState = subState.defaults;
  var handlers = subState.handlers;

  function reducer(state, action) {
    if (subState.logging && !action.type.startsWith('@@')) {
      console.log(subState.name + ' reducer called with state: ', state, ', action: ', action);
    }
    var actionType = action.type;
    var handler = handlers[actionType];
    if (typeof handler !== 'function') return state || defaultState;
    var newState = handler(state, action);
    return newState;
  }
  return reducer;
}

function createRouter(sub, routes) {
  var router = _reduxFirstRouter2.default.connectRoutes(routes, {
    // basename: '/',
    querySerializer: _reduxFirstRouter2.default.querySerializer
  });
  sub.reducers.location = router.reducer;
  sub.noPersist.push('location');
  return router;
}

/** @param {object[]} subStates */
function mapSubStates(subStates) {
  var noPersist = [];
  var reducers = {};
  var preloadedState;

  subStates.forEach(function (subState) {
    var name = subState.name;
    var subData;
    if (!subState.persist) {
      noPersist.push(name);
    } else if (subState.preload || subState.preload === undefined) {
      subData = preloadSubState(subState);
      if (subData !== undefined) {
        if (preloadedState === undefined) preloadedState = {};
        preloadedState[name] = subData;
      }
    }
    reducers[name] = createReducer(subState);
  });
  return {
    noPersist: noPersist,
    reducers: reducers,
    preloadedState: preloadedState
  };
}

/**
 * Load all persisted state data from localStorage.
 */
function preloadSubState(subState) {
  var subJSON = localStorage.getItem('reduxPersist:' + subState.name);
  var subData = JSON.parse(subJSON);
  return subData;
}

// Typedefs for intellisense.

/**
 * @typedef {Object} ReduxPersistor
 * @property {function} pause
 * @property {function} purge
 * @property {function} rehydrate
 * @property {function} resume
*/

/**
 * @typedef {Object} ReduxStore
 * @property {function} dispatch
 * @property {function} getState
 * @property {function} replaceReducer
 * @property {function} subscribe
*/