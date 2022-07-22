"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Tools = require("./Tools.js");

/*----------------------------------------*\
  client-perpetuite-3 - Position.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-07-21 15:23:22
  @Last Modified time: 2022-07-21 15:27:21
\*----------------------------------------*/
class Position {
  constructor(x, y, z, w = 0) {
    if (!((0, _Tools.isNumber)(x) && (0, _Tools.isNumber)(y) && (0, _Tools.isNumber)(z) && (0, _Tools.isNumber)(w))) throw Error(`Go Request Constructor takes 3 or 4 argument and they have to be numbers value`);
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  toString() {
    return `d${this.x} d${this.y} d${this.z} d${this.w}`;
  }

}

var _default = Position;
exports.default = _default;