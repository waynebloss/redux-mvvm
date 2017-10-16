'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reduxFirstRouter = require('redux-first-router');

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  connectRoutes: _reduxFirstRouter.connectRoutes,
  querySerializer: _queryString2.default
};