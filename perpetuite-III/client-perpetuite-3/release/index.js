#!/usr/bin/env node

/*----------------------------------------*\
  easyPlayer - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:12:19
  @Last Modified time: 2022-07-22 15:28:58
\*----------------------------------------*/
"use strict";

var _Request = _interopRequireDefault(require("./Request.js"));

var _Parameter = _interopRequireDefault(require("./Parameter.js"));

var _Position = _interopRequireDefault(require("./Position.js"));

var _Communication = _interopRequireDefault(require("./Communication.js"));

var _commander = require("commander");

var _Tools = require("./Tools.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const program = new _commander.Command();

function myParseInt(value, dummyPrevious) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10);

  if (isNaN(parsedValue)) {
    throw new commander.InvalidArgumentError('Not a number.');
  }

  return parsedValue;
}

const launchRequest = async (RequestBuilder, ...parameters) => {
  let res = await (0, _Communication.default)(RequestBuilder(...parameters));
  res = _Request.default.fromRaw(res);
  if (res.isFail()) throw res;
  return res.toString();
};

program.command('HighPower').argument('<flag>', 'boolean argument', _Tools.stringToBoolean).description('Set HighPower to motors. true turns the HighPower On & false turns the HighPower Off').action(flag => {
  launchRequest(_Request.default.HighPower, flag).then(data => console.log(data)).catch(error => console.log("Error : " + error.getErrorMessage()));
});
program.command('Go').argument('<x>', 'float argument', parseFloat).argument('<y>', 'float argument', parseFloat).argument('<z>', 'float argument', parseFloat).argument('<w>', 'float argument', parseFloat).description('Tell the robot to go at a position x y z with a orientation of w').action((x, y, z, w) => {
  launchRequest(_Request.default.Go, new _Position.default(x, y, z, w)).then(data => console.log(data)).catch(error => console.log("Error : " + error.getErrorMessage()));
});
/*

const main = async () => {



   // const res = await call(Request.Nothing());
   // Request.fromRaw(res);
   
 		
   // await call(Request.Break(false));
   // await call(Request.Gripper(true));
   // await call(Request.Speed(10));
   // await call(Request.Acc(50));
   // await call(Request.Go(new Position(1, 2, 3, 4)));
   // await call(Request.Follow([new Position(1, 2, 3), new Position(4, 5, 63)]));
}

main()
.then(data=>console.log(data))
.catch(error => console.log(error));
*/

program.parse();