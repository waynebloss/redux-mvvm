'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

exports.default = {
  applyMiddleware: _redux.applyMiddleware,
  combineReducers: _redux.combineReducers,
  compose: _redux.compose,
  createStore: _redux.createStore
};