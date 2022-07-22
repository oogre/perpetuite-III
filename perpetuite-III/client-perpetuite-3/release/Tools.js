"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uniqId = exports.stringToBoolean = exports.isRequest = exports.isPosition = exports.isNumber = exports.isInteger = exports.isFnc = exports.isFloat = exports.isBool = exports.isArray = void 0;

var _Position = _interopRequireDefault(require("./Position.js"));

var _Request = _interopRequireDefault(require("./Request.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*----------------------------------------*\
  easyPlayer - Tools.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:52:19
  @Last Modified time: 2022-07-22 11:09:32
\*----------------------------------------*/
const isFnc = n => n instanceof Function;

exports.isFnc = isFnc;

const isBool = n => typeof n == "boolean";

exports.isBool = isBool;

const isArray = n => Array.isArray(n);

exports.isArray = isArray;

const isFloat = n => n === +n && n !== (n | 0);

exports.isFloat = isFloat;

const isInteger = n => n === +n && n === (n | 0);

exports.isInteger = isInteger;

const isNumber = n => isFloat(n) || isInteger(n);

exports.isNumber = isNumber;

const isPosition = obj => obj instanceof _Position.default;

exports.isPosition = isPosition;

const isRequest = obj => obj instanceof _Request.default;

exports.isRequest = isRequest;

const uniqId = () => Math.floor(Math.random() * Date.now()).toString(16);

exports.uniqId = uniqId;

const stringToBoolean = n => {
  var _n$toLowerCase;

  if (isBool(n)) return n;

  switch (n === null || n === void 0 ? void 0 : (_n$toLowerCase = n.toLowerCase()) === null || _n$toLowerCase === void 0 ? void 0 : _n$toLowerCase.trim()) {
    case "true":
    case "1":
    case "yes":
      return true;

    case "false":
    case "0":
    case "no":
    case null:
    case undefined:
      return false;

    default:
      JSON.parse(n);
  }
};

exports.stringToBoolean = stringToBoolean;