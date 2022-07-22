#!/usr/bin/env node

/*----------------------------------------*\
  easyPlayer - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:12:19
  @Last Modified time: 2022-07-22 17:13:08
\*----------------------------------------*/

/*

		./release/index.js HighPower 1
		./release/index.js HighPower 0
		./release/index.js Go -- -100 0 0 0
		./release/index.js Speed -- 100
		./release/index.js Acc -- 10
*/
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
program.command('Break').argument('<flag>', 'boolean argument', _Tools.stringToBoolean).description('Enable/Disable Break motors. true turns the Break On & false turns the Break Off').action(flag => {
  launchRequest(_Request.default.Break, flag).then(data => console.log(data)).catch(error => console.log("Error : " + error.getErrorMessage()));
});
program.command('Gripper').argument('<flag>', 'boolean argument', _Tools.stringToBoolean).description('Enable/Disable Gripper. true turns the Gripper On & false turns the Gripper Off').action(flag => {
  launchRequest(_Request.default.Gripper, flag).then(data => console.log(data)).catch(error => console.log("Error : " + error.getErrorMessage()));
});
program.command('Go') // double -- to authorize negative value
.argument('<x>', 'float argument', parseFloat).argument('<y>', 'float argument', parseFloat).argument('<z>', 'float argument', parseFloat).argument('<w>', 'float argument', parseFloat).description('Tell the robot to go at a position x y z with a orientation of w').action((x, y, z, w) => {
  launchRequest(_Request.default.Go, new _Position.default(x, y, z, w)).then(data => console.log(data)).catch(error => console.log("Error : " + error.getErrorMessage()));
});
program.command('Follow') // double -- to authorize negative value
.description('Tell the robot to go at a position x y z with a orientation of w').action(() => {
  launchRequest(_Request.default.Follow, new _Position.default(300 * (Math.random() * 2 - 1), 300 * (Math.random() * 2 - 1), 300 * (Math.random() * 2 - 1), 300 * (Math.random() * 2 - 1))).then(data => {
    launchRequest(_Request.default.Follow, new _Position.default(300 * (Math.random() * 2 - 1), 300 * (Math.random() * 2 - 1), 300 * (Math.random() * 2 - 1), 300 * (Math.random() * 2 - 1))).then(data => {
      launchRequest(_Request.default.Follow, new _Position.default(300 * (Math.random() * 2 - 1), 300 * (Math.random() * 2 - 1), 300 * (Math.random() * 2 - 1), 300 * (Math.random() * 2 - 1))).then(data => {
        console.log("YO");
      }).catch(error => console.log("Error : " + error.getErrorMessage()));
    }).catch(error => console.log("Error : " + error.getErrorMessage()));
  }).catch(error => console.log("Error : " + error.getErrorMessage()));
});
program.command('Speed').argument('<speed>', 'int argument', parseInt).description('set the speed, 0 is minimum 100 is maximum').action(speed => {
  launchRequest(_Request.default.Speed, speed).then(data => console.log(data)).catch(error => console.log("Error : " + error.getErrorMessage()));
});
program.command('Acc').argument('<acc>', 'int argument', parseInt).description('set the acceleration/deceleration, 0 is minimum 100 is maximum').action(acc => {
  launchRequest(_Request.default.Acc, acc).then(data => console.log(data)).catch(error => console.log("Error : " + error.getErrorMessage()));
});
program.parse();