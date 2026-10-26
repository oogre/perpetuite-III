
import { Vector4 } from './../../tools/Vector.js';
import { Robot_limitter } from './limitter.js';
import * as Walk from './../Move/Walk';
import {getRandomOne, delay} from './../../tools/helpers.js';
import {lerp, inverseLerp} from './../../tools/math.js';

export const Robot_go = async (BASE, location)=>{
	BASE.robot.actionDesc = `Robot go ${location}`;

	// if(Math.random()<0.1){
	// 	const move = getRandomOne(Walk);
	// 	await move(BASE, location);
	// 	return true;
	// }


	const origin = BASE.robot.location4D;
	const dest = Robot_limitter(BASE, new Vector4(...location, origin.z, origin.w));
	const move = new Vector4().subVectors(origin, dest);
	if(move.lengthSq() > 0.1){
		await BASE.robot.go(dest);	
	}

	const dampingTime = lerp(20, 2000, inverseLerp(0, BASE.robot.conf.radius * 2, move.length()));
	await delay(dampingTime);
	console.log(`damping time : ${dampingTime}`);
	BASE.robot.actionDescPop();
	return true;
}

