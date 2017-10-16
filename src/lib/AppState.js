import Redux from './alias/redux';
import ReduxLogger from './alias/redux-logger';
import ReduxPersist from './alias/redux-persist';
import ReduxRouter from './alias/redux-first-router';

import VMUtil from './VMUtil';

const __DEV__ = process.env.NODE_ENV === 'development';

class _AppState {
  /**
   * The current redux persistor.
   * @type {ReduxPersistor}
   */
  persistor = null;
  /**
   * The current redux store.
   * @type {ReduxStore}
   */
  store = null;
  /**
   * Connects view models to views.
   * @param {function} ViewModelType The view-model class or object.
   * @param {function} View The view component class or function.
   */
  connect(ViewModelType, View) {
    return VMUtil.connect(ViewModelType, View);
  }
  /**
   * Returns a new redux state store.
   * @param {object[]} subStates Array of sub-states.
   * @param {object} routes Map of actions to url.
   */
  createStore(subStates, routes) {
    if (AppState.store)
      throw new Error('AppState store already created.');

    const sub = mapSubStates(subStates);
    const router = createRouter(sub, routes);
    const rootReducer = Redux.combineReducers(sub.reducers);
    const middleware = configureMiddleware(router.middleware);
    const enhancedMiddleware = Redux.compose(router.enhancer, middleware);
    const store = Redux.createStore(rootReducer, sub.preloadedState, enhancedMiddleware);
    const persistor = ReduxPersist.createPersistor(store, {blacklist: sub.noPersist});

    AppState.persistor = persistor;
    AppState.store = store;
    
    return store;
  }
  /**
   * Dispatch an action with the store.
  */
  dispatch(action) {
    AppState.store.dispatch(action);
  }
  
  /**
   * Purge persisted state with the persistor.
   */
  purge() {
    AppState.persistor.purge();
  }
}
const AppState = new _AppState();
export default AppState;

function configureMiddleware(...middleware) {
  var middlewareToApply = [];
  if (__DEV__) {
    let logger = ReduxLogger.createLogger();
    middlewareToApply.push(logger);
  }
  middlewareToApply = middlewareToApply.concat(middleware);
  return Redux.applyMiddleware(...middlewareToApply);
}

function createReducer(subState) {
  const subReducer = subState.reducer;
  if (subReducer)
    return subReducer;
  const defaultState = subState.defaults;
  const handlers = subState.handlers;

  function reducer(state, action) {
    if (subState.logging && !action.type.startsWith('@@')) {
      console.log(subState.name + 
        ' reducer called with state: ', state, 
        ', action: ', action);
    }
    const actionType = action.type;
    const handler = handlers[actionType];
    if (typeof handler !== 'function')
      return state || defaultState;
    const newState = handler(state, action);
    return newState;
  }
  return reducer;
}

function createRouter(sub, routes) {
  const router = ReduxRouter.connectRoutes(routes, {
    // basename: '/',
    querySerializer: ReduxRouter.querySerializer,
  });
  sub.reducers.location = router.reducer;
  sub.noPersist.push('location');
  return router;
}

/** @param {object[]} subStates */
function mapSubStates(subStates) {
  const noPersist = [];
  const reducers = {};
  var preloadedState;
  
  subStates.forEach(subState => {
    const name = subState.name;
    var subData;
    if (!subState.persist) {
      noPersist.push(name);
    } else if (subState.preload || subState.preload === undefined) {
      subData = preloadSubState(subState);
      if (subData !== undefined) {
        if (preloadedState === undefined)
          preloadedState = {};
        preloadedState[name] = subData;
      }
    }
    reducers[name] = createReducer(subState);
  });
  return {
    noPersist,
    reducers,
    preloadedState,
  };
}

/**
 * Load all persisted state data from localStorage.
 */
function preloadSubState(subState) {
  const subJSON = localStorage.getItem('reduxPersist:' + subState.name);
  const subData = JSON.parse(subJSON);
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
