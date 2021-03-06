#!/usr/bin/env node

/*----------------------------------------*\
  easyPlayer - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:12:19
  @Last Modified time: 2022-07-25 17:01:09
\*----------------------------------------*/

/*

		./release/index.js HighPower -d -- 1
		./release/index.js HighPower -d -- 0
		./release/index.js HighPower -- 0
		./release/index.js HighPower -- 1
		./release/index.js Go -d -- -100 0 0 0
		./release/index.js Go -d -- -100 0 0 0
		./release/index.js Speed -- 100
		./release/index.js Acc -- 10

		../randomPositionGenerator/release/index.js -t 1000 -- -600 600 -600 600 -200 0 -45 45 | ./release/index.js Follow -
		../randomPositionGenerator/release/index.js -t 1000 -- -600 600 -600 600 -200 0 -45 45 | ./release/index.js Follow -d -
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

const main = async (RequestBuilder, parameters, debug = false) => {
  try {
    const req = RequestBuilder(parameters);
    if (debug) return console.log(req.toString());

    const res = _Request.default.fromRaw(await (0, _Communication.default)(req));

    if (res.isFail()) throw res;
    return res.toString();
  } catch (error) {
    console.log(`Error : ${error !== null && error !== void 0 && error.getErrorMessage ? error.getErrorMessage() : error}`);
  }
};

program.command('HighPower').option('-d, --debug [debug]', 'debug', false, _Tools.stringToBoolean).argument('<flag>', 'boolean argument', _Tools.stringToBoolean).description('Set HighPower to motors. true turns the HighPower On & false turns the HighPower Off').action((flag, {
  debug
}) => {
  main(_Request.default.HighPower, flag, debug);
});
program.command('Gripper').option('-d, --debug [debug]', 'debug', false, _Tools.stringToBoolean).argument('<flag>', 'boolean argument', _Tools.stringToBoolean).description('Enable/Disable Gripper. true turns the Gripper On & false turns the Gripper Off').action((flag, {
  debug
}) => {
  main(_Request.default.Gripper, flag, debug);
});
program.command('Go').option('-d, --debug [debug]', 'debug', false, _Tools.stringToBoolean) // double -- to authorize negative value
.argument('<x>', 'float argument', parseFloat).argument('<y>', 'float argument', parseFloat).argument('<z>', 'float argument', parseFloat).argument('<w>', 'float argument', parseFloat).description('Tell the robot to go at a position x y z with a orientation of w').action((x, y, z, w, {
  debug
}) => {
  main(_Request.default.Go, new _Position.default(x, y, z, w), debug);
});
program.command('ZProbe').option('-d, --debug [debug]', 'debug', false, _Tools.stringToBoolean) // double -- to authorize negative value
.argument('<x>', 'float argument', parseFloat).argument('<y>', 'float argument', parseFloat).description('Tell the robot to go at max z for the position x y').action((x, y, {
  debug
}) => {
  main(_Request.default.ZProbe, new _Position.default(x, y, 0, 0), debug).then(data => console.log(data)).catch(error => console.log(error));
});
program.command('Follow').option('-d, --debug [debug]', 'debug', false, _Tools.stringToBoolean).description('pipe values (x y z w\\n) into this command').action(({
  debug
}) => {
  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  rl.on('line', line => {
    const coord = line.trim().split(" ").map(v => parseFloat(v));
    main(_Request.default.Follow, new _Position.default(...coord), debug);
  });
});
program.command('Speed').option('-d, --debug [debug]', 'debug', false, _Tools.stringToBoolean).argument('<speed>', 'int argument', parseInt).description('set the speed, 0 is minimum 100 is maximum').action((speed, {
  debug
}) => {
  main(_Request.default.Speed, speed, debug);
});
program.command('Acc').option('-d, --debug [debug]', 'debug', false, _Tools.stringToBoolean).argument('<acc>', 'int argument', parseInt).description('set the acceleration/deceleration, 0 is minimum 100 is maximum').action((acc, {
  debug
}) => {
  main(_Request.default.Acc, acc, debug);
});
program.parse();