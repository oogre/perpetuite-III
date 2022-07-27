"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Tools = require("./Tools.js");

var _Parameter = _interopRequireDefault(require("./Parameter.js"));

var _ErrorDictionnary = _interopRequireDefault(require("./ErrorDictionnary.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const REQUEST_TYPE = Object.freeze({
  Nothing: Symbol("Nothing"),
  ok: Symbol("ok"),
  ko: Symbol("ko"),
  HighPower: Symbol("HighPower"),
  // param ON-OFF
  Gripper: Symbol("Gripper"),
  // param ON-OFF
  Speed: Symbol("Speed"),
  // param int[0-100]
  Acc: Symbol("Acc"),
  // param int[0-100]
  Go: Symbol("Go"),
  // param x y z w
  Follow: Symbol("Follow"),
  // param x1 y1 z1 w1 x2 y2 z2 w2 ... xn yn zn wn
  ZProbe: Symbol("ZProbe"),
  // param x y -- replay z
  GetPosition: Symbol("GetPosition"),
  // param /
  GetSpeed: Symbol("GetSpeed"),
  // param /
  GetAcc: Symbol("GetAcc") // param /

});

class Request {
  constructor(type, parameters = []) {
    this.type = type;
    this.parameters = parameters;
  }

  isSuccess() {
    return this.type == REQUEST_TYPE.ok;
  }

  isFail() {
    return this.type == REQUEST_TYPE.ko;
  }

  getErrorMessage() {
    var _this$parameters$, _this$parameters$2;

    return _ErrorDictionnary.default["" + ((_this$parameters$ = this.parameters[0]) === null || _this$parameters$ === void 0 ? void 0 : _this$parameters$.value)] || `${_ErrorDictionnary.default.unknown} : ${(_this$parameters$2 = this.parameters[0]) === null || _this$parameters$2 === void 0 ? void 0 : _this$parameters$2.value}`;
  }

  static fromRaw(rawData) {
    // true for HighPower false for LowPower
    let splitedData = rawData.split(" ");
    if (splitedData.length <= 0) throw Error(`Raw Data to build a request is wrong formatted`);
    const [typeName, typeValue] = Object.entries(REQUEST_TYPE).find(([key, value]) => value.description == splitedData[0]);
    const length = parseInt(splitedData[1]);
    const parameters = [];

    for (let i = 0; i < length; i++) {
      parameters.push(_Parameter.default.fromRawType(splitedData[i + 2].charAt(0), splitedData[i + 2].substr(1)));
    }

    return new Request(typeValue, parameters);
  }

  static Nothing() {
    // true for HighPower false for LowPower
    return new Request(REQUEST_TYPE.Nothing);
  }

  static HighPower(bool) {
    // true for HighPower false for LowPower
    if (!(0, _Tools.isBool)(bool)) throw Error(`HighPower Request Constructor takes one argument and it has to be boolean value (true > High and false > Low)`);
    return new Request(REQUEST_TYPE.HighPower, [_Parameter.default.fromBool(bool)]);
  }

  static Gripper(bool) {
    // true for Grab false for Release
    if (!(0, _Tools.isBool)(bool)) throw Error(`Gripper Request Constructor takes one argument and it has to be boolean value (true > Grab and false > Release)`);
    return new Request(REQUEST_TYPE.Gripper, [_Parameter.default.fromBool(bool)]);
  }

  static Speed(int) {
    // [0-100] [slowest-fastest]
    if (!(0, _Tools.isInteger)(int)) throw Error(`Speed Request Constructor takes one argument and it has to be an integer value (0 is the slowest speed 100 is the fastest)`);
    if (int < 0 || int > 100) throw Error(`Speed Request Constructor argument must be int the interval [0 - 100]`);
    return new Request(REQUEST_TYPE.Speed, [_Parameter.default.fromInt(int)]);
  }

  static Acc(int) {
    // [0-100] [slowest-fastest]
    if (!(0, _Tools.isInteger)(int)) throw Error(`Acc Request Constructor takes one argument and it has to be an integer value (0 is the low acceleration speed 100 is high acceleration)`);
    if (int < 0 || int > 100) throw Error(`Acc Request Constructor argument must be int the interval [0 - 100]`);
    return new Request(REQUEST_TYPE.Acc, [_Parameter.default.fromInt(int)]);
  }

  static Go(position) {
    if (!(0, _Tools.isPosition)(position)) throw Error(`Go Request Constructor takes a argument and it has to be a Postion value`);
    return new Request(REQUEST_TYPE.Go, [..._Parameter.default.fromPosition(position)]);
  }

  static ZProbe(position) {
    if (!(0, _Tools.isPosition)(position)) throw Error(`ZProbe Request Constructor takes a argument and it has to be a Postion value`);
    return new Request(REQUEST_TYPE.ZProbe, [..._Parameter.default.fromPosition(position)]);
  }

  static Follow(positions) {
    if (!(0, _Tools.isPosition)(positions)) throw Error(`Go Request Constructor takes a argument and it has to be a Postion value`);
    return new Request(REQUEST_TYPE.Follow, [..._Parameter.default.fromPosition(positions)]); // if(!isArray(positions))
    //   throw Error(`Follow Request Constructor takes one argument and it has to be an array`);
    // positions.forEach(position => {
    //    if (!isPosition(position))
    //       throw Error(`Follow Request Constructor takes one argument and it has to be an array of Postion value`);
    // });
    // return new Request(REQUEST_TYPE.Follow, positions.map(position=>Parameter.fromPosition(position)).flat());
  }

  toString() {
    return `${this.type.description} ${this.parameters.length} ${this.parameters.map(parameter => parameter.toString()).join(" ")}`;
  }

}

exports.default = Request;