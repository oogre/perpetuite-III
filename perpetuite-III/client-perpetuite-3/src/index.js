#!/usr/bin/env node
/*----------------------------------------*\
  easyPlayer - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:12:19
  @Last Modified time: 2022-07-22 15:17:14
\*----------------------------------------*/


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
		// let res = await call(Request.HighPower(flag));
		// res = Request.fromRaw(res);
		// if(res.isFail()) {
		// 	console.log("Error : " + res.getErrorMessage());
		// 	return;
		// }
		// console.log(res.toString());

		launchRequest(Request.HighPower, flag)
			.then( data => console.log(data) )
			.catch( error => console.log("Error : " + error.getErrorMessage()))
	});


program
	.command('Go')
	.argument('<x>', 'float argument', parseFloat)
	.argument('<y>', 'float argument', parseFloat)
	.argument('<z>', 'float argument', parseFloat)
	.argument('[w]', 'float argument', 0, parseFloat)
	.description('Tell the robot to go at a position x y z with a orientation of w')
	.action( (x, y, z, w) => {
		launchRequest(Request.Go, new Position(x, y, z, w))
			.then( data => console.log(data) )
			.catch( error => console.log("Error : " + error.getErrorMessage()))
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