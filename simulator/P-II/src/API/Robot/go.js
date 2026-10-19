
import { Vector4 } from './../../tools/Vector.js';
import { Robot_limitter } from './limitter.js';
import * as Walk from './../Move/Walk';
import {getRandomOne} from './../../tools/helpers.js';

export const Robot_go = async (BASE, location)=>{
	BASE.robot.actionDesc = `Robot go ${location}`;

	// if(Math.random()<0.1){
	// 	const move = getRandomOne(Walk);
	// 	await move(BASE, location);
	// 	return true;
	// }


	const origin = BASE.robot.location4D;
	const dest = Robot_limitter(BASE, new Vector4(...location, origin.z, origin.w));

	console.log(`Robot go ${dest}`)

	const move = new Vector4().subVectors(origin, dest);


	console.log(`Robot move ${move}`)
	if(move.lengthSq() > 0.1){
		await BASE.robot.go(dest);	
	}
	BASE.robot.actionDescPop();
	return true;
}

