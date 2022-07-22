"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _config_2 = _interopRequireDefault(require("./_config_.js"));

var _Tools = require("./Tools.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*----------------------------------------*\
  client-perpetuite-3 - Communication.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-07-21 15:58:08
  @Last Modified time: 2022-07-22 11:12:58
\*----------------------------------------*/
const net = require('net');

var _default = async req => {
  // Request object
  console.log(req.toString());
  return new Promise((resolve, reject) => {
    if (!(0, _Tools.isRequest)(req)) return reject("Call communication takes only Request Object as parameter ");
    const client = net.createConnection(_config_2.default.connection, () => {
      client.write(req.toString());
    });
    client.on('data', data => {
      resolve(data);
      client.end();
    });
    client.on("error", e => {
      reject(`${e && e.message}`);
    });
    client.on('end', () => {
      console.log('CLIENT: I disconnected from the server.');
    });
  });
};

exports.default = _default;