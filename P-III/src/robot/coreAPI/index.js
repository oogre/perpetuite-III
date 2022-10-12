#!/usr/bin/env node
/*----------------------------------------*\
  client-perpetuite-3 - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:12:19
  @Last Modified time: 2022-08-22 20:21:59
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

import { Command } from 'commander';

import Request from './Request.js';
import Parameter from './Parameter.js';
import Position from './Position.js';
import call from './Communication.js';
import {stringToBoolean, lerp} from './tools.js';

const program = new Command();

const wait = (time) => {
	return new Promise(resolve => {
		setTimeout(resolve, time);
	});
}

const main = async (RequestBuilder, parameters, debug = false) => {
	const req = RequestBuilder(parameters);
	if(debug){
		await wait(1000);
		return req;
	}
	const res = Request.fromRaw( await call(req) );
	if(res.isFail()) return process.stderr.write(JSON.stringify(res.getErrorMessage()));
	return res;
}


program
	.command('HighPower')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	.argument('<flag>', 'boolean argument', stringToBoolean)
	.description('Set HighPower to motors. true turns the HighPower On & false turns the HighPower Off')
	.action( (flag, {debug}) => {
		main(Request.HighPower, flag, debug)
	});


program
	.command('Gripper')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	.argument('<flag>', 'boolean argument', stringToBoolean)
	.description('Enable/Disable Gripper. true turns the Gripper On & false turns the Gripper Off')
	.action( (flag, {debug}) => {
		main(Request.Gripper, flag, debug)
	});


program
	.command('Go')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	// double -- to authorize negative value
	.argument('<x>', 'float argument', parseFloat)
	.argument('<y>', 'float argument', parseFloat)
	.argument('<z>', 'float argument', parseFloat)
	.argument('<w>', 'float argument', parseFloat)
	.description('Tell the robot to go at a position x y z with a orientation of w')
	.action( (x, y, z, w, {debug}) => {
		main(Request.Go, new Position(x, y, z, w), debug)
	});


program
	.command('ZProbe')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	// double -- to authorize negative value
	.argument('<x>', 'float argument', parseFloat)
	.argument('<y>', 'float argument', parseFloat)
	.description('Tell the robot to go at max z for the position x y')
	.action( (x, y, {debug}) => {
		main(Request.ZProbe, new Position(x, y, 0, 0), debug)
		.then(res => {
			if(debug)return res.toJson();
			console.log(res.toJson())
		})
		.catch(error => console.error(error));
	});


program
	.command('GetPosition')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	// double -- to authorize negative value
	.description('Ask the robot its position x y z w')
	.action( ({debug}) => {

		main(Request.GetPosition, null, debug)
		.then(res => {
			if(debug){
				return console.log(
					JSON.stringify([
						lerp(-550, 550, Math.random()), 
						lerp(-550, 550, Math.random()), 
						lerp(0, -300, Math.random()), 
						lerp(-45, 45, Math.random())
					])
				);
			}else{
				console.log(res.toJson())	
			}
		})
		.catch(error => console.error(error));
	});


program
	.command('WaitProbe')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	// double -- to authorize negative value
	.description('Tell the robot to wait z probe clicked')
	.action( ({debug}) => {
		main(Request.WaitProbe, null, debug);
	});


program
	.command('IdleZ')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	// double -- to authorize negative value
	.description('Tell the robot to wait before ZProbe')
	.action( ({debug}) => {
		main(Request.IdleZ, null, debug)
	});


program
	.command('Follow')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	.description('pipe values (x y z w\\n) into this command')
	.action( ({debug}) => {
		const readline = require('readline');
		const rl = readline.createInterface({
		  input: process.stdin,
		  output: process.stdout,
		  terminal: false
		});

		rl.on('line', (line) => {
				const coord = line.trim().split(" ").map(v=>parseFloat(v));
				main(Request.Follow, new Position(...coord), debug)
		});
	});


program
	.command('Speed')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	.argument('<speed>', 'int argument', parseInt)
	.description('set the speed, 0 is minimum 100 is maximum')
	.action( (speed, {debug}) => {
		main(Request.Speed, speed, debug)
	});


program
	.command('Acc')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	.argument('<acc>', 'int argument', parseInt)
	.description('set the acceleration, 0 is minimum 100 is maximum')
	.action( (acc, {debug}) => {
		main(Request.Acc, acc, debug)
	});


program
	.command('Dcc')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	.argument('<dcc>', 'int argument', parseInt)
	.description('set the deceleration, 0 is minimum 100 is maximum')
	.action( (dcc, {debug}) => {
		main(Request.Dcc, dcc, debug)
	});


program
	.command('Reset')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	.description('reset default Speed/Acc')
	.action( ({debug}) => {
		main(Request.Reset, null, debug)
	});


program
	.command('Stop')
	.option('-d, --debug [debug]', 'debug', false, stringToBoolean)
	.description('Stop current move')
	.action( ({debug}) => {
		main(Request.Stop, null, debug)
	});


program.parse();

