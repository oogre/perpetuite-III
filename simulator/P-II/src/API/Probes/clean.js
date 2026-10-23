import { Vector4, Vector2 } from './../../tools/Vector.js';
import { Robot_go, Robot_grab, Robot_drop, Robot_speed, Robot_acc, Robot_dcc, Robot_gripper } from '../Robot';
import {delay} from './../../tools/helpers.js';
import {Memory_clear} from './../Memory';
import {Camera_capture} from './../Camera';

export const Probes_clean = async (BASE)=>{

	const robotLocationBefore = BASE.robot.location2D;
	const pillsToRemove = (await Camera_capture(BASE, [true])).set.toArray()
	let LEN = pillsToRemove.length;
	let counter = LEN;

	try{
		for(const pill of pillsToRemove){
			await Robot_go(BASE, new Vector2(...pill.location));
			await Robot_grab(BASE);
			const alpha = (Math.PI * 2 / LEN) * counter;
			await Robot_go(BASE, new Vector2( robotLocationBefore.x + 200 * Math.cos(alpha), robotLocationBefore.y + 200 * Math.sin(alpha) ));
			await Robot_drop(BASE);
			counter--;
		}
	}catch(error){
		console.log(error);
		await Robot_gripper(BASE, [false]);
		return false;
	}
	await Robot_gripper(BASE, [false]);
	return true;
}


