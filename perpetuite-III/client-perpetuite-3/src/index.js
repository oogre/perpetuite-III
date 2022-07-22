#!/usr/bin/env node
/*----------------------------------------*\
  easyPlayer - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:12:19
  @Last Modified time: 2022-07-22 16:20:55
\*----------------------------------------*/
/*

		./release/index.js HighPower 1
		./release/index.js HighPower 0
		./release/index.js Go -- -100 0 0 0
		./release/index.js Speed -- 100
		./release/index.js Acc -- 10
*/
import Request from './Request.js';
import Parameter from './Parameter.js';
import Position from './Position.js';
import call from './Communication.js';
import { Command } from 'commander';
const program = new Command();

import {stringToBoolean, isBool} from './Tools.js'


function myParseInt(value, dummyPrevious) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new commander.InvalidArgumentError('Not a number.');
  }
  return parsedValue;
}

const launchRequest = async (RequestBuilder, ...parameters) => {
	let res = await call(RequestBuilder(...parameters));
		res = Request.fromRaw(res);
		if(res.isFail()) throw res;
		return res.toString();
}


program
	.command('HighPower')
	.argument('<flag>', 'boolean argument', stringToBoolean)
	.description('Set HighPower to motors. true turns the HighPower On & false turns the HighPower Off')
	.action( flag => {
		launchRequest(Request.HighPower, flag)
			.then( data => console.log(data) )
			.catch( error => console.log("Error : " + error.getErrorMessage()))
	});

program
	.command('Break')
	.argument('<flag>', 'boolean argument', stringToBoolean)
	.description('Enable/Disable Break motors. true turns the Break On & false turns the Break Off')
	.action( flag => {
		launchRequest(Request.HighPower, flag)
			.then( data => console.log(data) )
			.catch( error => console.log("Error : " + error.getErrorMessage()))
	});


program
	.command('Go')
	// double -- to authorize negative value
	.argument('<x>', 'float argument', parseFloat)
	.argument('<y>', 'float argument', parseFloat)
	.argument('<z>', 'float argument', parseFloat)
	.argument('<w>', 'float argument', parseFloat)
	.description('Tell the robot to go at a position x y z with a orientation of w')
	.action( (x, y, z, w) => {
		launchRequest(Request.Go, new Position(x, y, z, w))
			.then( data => console.log(data) )
			.catch( error => console.log("Error : " + error.getErrorMessage()))
	});


program
	.command('Speed')
	.argument('<speed>', 'int argument', parseInt)
	.description('set the speed, 0 is minimum 100 is maximum')
	.action( (speed) => {
		launchRequest(Request.Speed, speed)
			.then( data => console.log(data) )
			.catch( error => console.log("Error : " + error.getErrorMessage()))
	});


program
	.command('Acc')
	.argument('<acc>', 'int argument', parseInt)
	.description('set the acceleration/deceleration, 0 is minimum 100 is maximum')
	.action( (acc) => {
		launchRequest(Request.Acc, acc)
			.then( data => console.log(data) )
			.catch( error => console.log("Error : " + error.getErrorMessage()))
	});


program.parse();
