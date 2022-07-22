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
  @Last Modified time: 2022-07-22 14:29:46
\*----------------------------------------*/
const net = require('net');

var _default = async req => {
  // Request object
  return new Promise((resolve, reject) => {
    if (!(0, _Tools.isRequest)(req)) return reject("Call communication takes only Request Object as parameter ");
    const client = net.createConnection(_config_2.default.connection, () => {
      client.write(req.toString());
    });
    client.on('data', data => {
      client.end();
      if ((0, _Tools.isBuffer)(data)) data = data.toString('utf8');
      resolve(data);
    });
    client.on("error", e => {
      client.end();
      reject(`${e && e.message}`);
    });
    client.on('end', () => {
      console.log('CLIENT : closed');
    });
  });
};

exports.default = _default;